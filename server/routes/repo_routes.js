const express = require('express');
const router = express.Router();
const repo_controller = require('../controllers/repo_controller');
const ensureAuthenticated=require('../middleware/authenticated')

router.get('/repos', ensureAuthenticated, repo_controller.fetchAllRepos);
router.post('/deploy', ensureAuthenticated, repo_controller.deploy_repo)


module.exports = router;
