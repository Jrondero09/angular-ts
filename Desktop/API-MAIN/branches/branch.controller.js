const express = require('express');
const router = express.Router();
const branchService = require('./branch.service');

router.get('/', getAllBranch);
router.get('/:id', getBranchById);
router.post('/', createBranch);
router.put('/:id', updateBranch);
router.delete('/:id', _deleteBranch);
router.post('/:id/assign/:userId', assignUser);
router.post('/:id/remove/:userId', removeUserFromBranch);

module.exports = router;

function getAllBranch(req, res, next) {
    branchService.getAllBranch()
        .then(branches => res.json(branches))
        .catch(next);
}
function getBranchById(req, res, next) {
    branchService.getBranchById(req.params.id)
        .then(branch => res.json(branch))
        .catch(next);
}
function createBranch(req, res, next) {
    branchService.createBranch(req.body)
        .then(() => res.json({ message: 'Branch created' }))
        .catch(next);
}
function updateBranch(req, res, next) {
    branchService.updateBranch(req.params.id, req.body)
        .then(() => res.json({ message: 'Branch updated' }))
        .catch(next);
}
function _deleteBranch(req, res, next) {
    branchService.deleteBranch(req.params.id)
        .then(() => res.json({ message: 'Branch deleted' }))
        .catch(next);
}
function assignUser(req, res, next) {
    branchService.assignUser(req.params.id, req.params.userId)
        .then(() => res.json({ message: 'User assigned to branch' }))
        .catch(next);
}
function removeUserFromBranch(req, res, next) {
    branchService.removeUserFromBranch(req.params.id, req.params.userId)
        .then(() => res.json({ message: 'User removed from branch' }))
        .catch(next);
}
//======================================================================================================

router.put('/:id/deactivate',deactivateBranch);
router.put('/:id/reactivate',reactivateBranch);

function deactivateBranch(req, res, next) {
    branchService.deactivateBranch(req.params.id)
        .then(() => res.json({ message: 'User deactivated successfully' }))
        .catch(next);
}
function reactivateBranch(req, res, next) {
    branchService.reactivateBranch(req.params.id)
        .then(() => res.json({ message: 'User reactivated successfully' }))
        .catch(next);
}