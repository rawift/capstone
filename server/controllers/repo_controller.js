const { exec } = require('child_process');
const fetch = require('node-fetch'); // If you need to fetch repos from GitHub API


// Endpoint to fetch all repositories from GitHub
exports.fetchAllRepos = async (req, res) => {
  try {
    const { accessToken, username } = req.user;
    const response = await fetch('https://api.github.com/user/repos', {
      headers: {
        'Authorization': `token ${accessToken}`, // Use a personal access token
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!response.ok) {
      throw new Error(`GitHub API request failed: ${response.statusText}`);
    }

    const repos = await response.json();
    // Filter repos to include only those where the user is the owner
    const ownedRepos = repos.filter(repo => repo.owner.login === username);

    res.json(ownedRepos);
  } catch (error) {
    console.error('Error fetching repositories:', error);
    res.status(500).send('Error fetching repositories');
  }
};


exports.deploy_repo = async (req, res) => {
  try {
    console.log("deploying...")
    console.log(req.body)
    /*const { accessToken, username } = req.user;
    const response = await fetch('https://api.github.com/user/repos', {
      headers: {
        'Authorization': `token ${accessToken}`, // Use a personal access token
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!response.ok) {
      throw new Error(`GitHub API request failed: ${response.statusText}`);
    }

    const repos = await response.json();
    res.json(repos);*/
  } catch (error) {
    console.error('Error Deploying Repo:', error);
    res.status(500).send('Error Deploying repositories');
  }
};


