const config = require('config.json'); 
const jwt = require('jsonwebtoken'); 
const bcrypt = require('bcryptjs'); 
const crypto = require("crypto"); 
const { Op } = require('sequelize');
const sendEmail = require('_helpers/send-email'); 
const db = require('_helpers/db');
const Role = require('_helpers/role');

module.exports = {    
authenticate,
refreshToken,
revokeToken,
register,
verifyEmail,
forgotPassword,
validateResetToken,
resetPassword,
getAll,
getById,
create,
update,
delete: _delete
};

async function authenticate({ email, password, ipAddress }) {
    const account = await db.Account.scope('withHash').findOne({ where: { email } });

    if (!account || !account.isVerified || !(await bcrypt.compare (password, account.passwordHash))) { 
        throw 'Email or password is incorrect';
    }
    // authentication successful so generate jwt and refresh tokens
    const jwtToken = generateJwtToken(account);
    const refreshToken = generateRefreshToken (account, ipAddress);
    // save refresh token
    await refreshToken.save();
    // return basic details and tokens
    return {
    ...basicDetails (account), jwtToken,
    refreshToken: refreshToken.token
    }
};

async function refreshToken({ token, ipAddress }) { 
    const refreshToken = await getRefreshToken (token); 
    const account = await refreshToken.getAccount();
    // replace old refresh token with a new one and save 
    const newRefreshToken = generateRefreshToken(account, ipAddress); 
    refreshToken.revoked = Date.now(); 
    refreshToken.revokedByIp = ipAddress; 
    refreshToken.replacedByToken=newRefreshToken.token;
    await refreshToken.save();
    await newRefreshToken.save();
    // generate new jwt
    const jwtToken = generateJwtToken(account);
    // return basic details and tokens
    return {
    ...basicDetails(account),
    jwtToken,
    refreshToken: newRefreshToken.token
    };
}

async function revokeToken({ token, ipAddress}) { 
    const refreshToken = await getRefreshToken (token);

    // revoke token and save
    refreshToken. revoked = Date.now(); 
    refreshToken.revokedByIp = ipAddress; 
    await refreshToken.save();
}

async function register(params, origin) {
    if (await db.Account.findOne({ where: { email: params.email } })) {
    return await sendAlreadyRegisteredEmail(params.email, origin);
}
    const account = new db.Account (params);
    const isFirstAccount = (await db.Account.count()) === 0;

    account.role
    isFirstAccount ? Role.Admin: Role.User;
    account.verificationToken = randomTokenString();
    account.passwordHash = await hash (params.password);

    await account.save();
    await sendVerificationEmail(account, origin);
}

async function verifyEmail({ token }) {
    const account = await db.Account.findOne({ where: { verificationToken: token } });

    if (!account) throw 'Verification failed';

    account.verified = Date.now();
    account.verificationToken = null;
    await account.save();
}

async function forgotPassword({ email }, origin) {
    const account = await db.Account.findOne({ where: { email } });

    // always return ok response to prevent email enumeration
    if (!account) return;

    // create reset token that expires after 24 hours
    account.resetToken = randomTokenString();
    account.resetTokenExpires= new Date(Date.now() + 24*60*60*1000);
    await account.save();

    // send email
    await sendPasswordResetEmail(account, origin);
}

async function validateResetToken({ token }) { const account = await db.Account.findOne({

    where: {
        resetToken: token,
        resetTokenExpires: { [Op.gt]: Date.now() }
    }
    });

    if (!account) throw 'Invalid token';
    return account;

    }

async function  resetPassword({ token, password }) { 
    const account = await validateResetToken({ token });

    account.passwordHash = await hash (password); account.passwordReset = Date.now();
    account.resetToken = null;
    await account.save();
}

async function getAll() {
    const accounts = await db.Account.findAll(); return accounts.map(x => basicDetails(x));
}

async function getById(id) {
    const account = await getAccount(id); 
    return basicDetails (account);
}

async function create(params) {

    if (await db.Account.findOne({ where: { email: params.email } })) { 
        throw 'Email"' + params.email + '" is already registered';
    }
    const account = new db.Account (params);
    account.verified = Date.now();
    
    account.passwordHash = await hash (params.password);

    await account.save();
    return basicDetails (account);
}

async function update(id, params) {
    const account = await getAccount(id);
  
    if (params.email && account.email !== params.email && await db.Account.findOne({ where: { email: params.email } })) { 
        throw 'Email"' + params.email + '" is already taken';
    }
    
    if (params.password) {
        params.passwordHash = await hash (params.password);
    }
    
    
    Object.assign(account, params); 
    account.updated = Date.now(); 
    await account.save();

    return basicDetails (account);
}

async function _delete(id) {
    const account = await getAccount(id);
    await account.destroy();
}

// helper functions
async function getAccount(id) {
    const account = await db.Account.findByPk(id); if (!account) throw 'Account not found';
    return account;
    }

async function getRefreshToken (token) {
    const refreshToken = await db.RefreshToken.findOne({ where: {token} });
    if (!refreshToken || !refreshToken.isActive) throw 'Invalid token'; 
    return refreshToken;
    }

async function hash (password) {
    return await bcrypt.hash (password, 10);
    }

function generateJwtToken(account) {
    return jwt.sign({ sub: account.id, id: account.id}, config.secret, { expiresIn: '15m' });
}

function generateRefreshToken (account, ipAddress) { 
    return new db.RefreshToken({
        accountId: account.id,
        token: randomTokenString(),
        expires: new Date(Date.now() + 7*24*60*60*1000), 
        createdByIp: ipAddress
});
}

function randomTokenString() {
    return crypto.randomBytes(40).toString('hex');
}

function basicDetails (account) {
    const { id, title, firstName, lastName, email, role, created, updated, isVerified} = account; 
    return { id, title, firstName, lastName, email, role, created, updated, isVerified };
}

async function sendVerificationEmail(account, origin) {
    let message;
    if (origin) {
        const verifyUrl = `${origin}/account/verify=email?token=${account.verificationToken}`; 
        message = `<p>Please click the below link to verify your email address:</p>
                    <p><a href="${verifyUrl}">${verifyUrl}</a></p>`;

    } else {
        message = `<p>Please use the below token to verify your email address with the <code>/account/verify-email</code> api route:</p>
                    <p><code>${account.verificationToken}</code></p>`;
    }


await sendEmail({
        to: account.email,
        subject: 'Sign-up Verification API Verify Email',
        html: `<h4>Verify Email</h4>
                <p>Thanks for registering!</p>
                 ${message}`
    });
}

async function sendPasswordResetEmail(account, origin) {
    let message;
    if (origin) {
            const reseturl = `${origin}/account/reset-password?token=${account.resetToken}`;
            message = `<p>Please click the below link to reset your password, the link will be valid for 1 day:</p>
                        <p><a href="${resetUrl}">${resetUrl}</a></p>`;

    } else {
         message = `<p>Please use the below token to reset your password with the <code>/account/reset-password</code> api route:</p> 
         <p><code>${account.resetToken}</code></p>`;
    }

await sendEmail({
    to: account.email,
    subject: 'Sign-up Verification API - Reset Password',
    html: `<h4>Reset Password Email</h4>
    ${message}`
});

}