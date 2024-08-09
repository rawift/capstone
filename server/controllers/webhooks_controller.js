const { exec } = require('child_process');
const fetch = require('node-fetch'); // If you need to fetch repos from GitHub API

// Endpoint to handle GitHub webhook for deployments
exports.handleWebhook = (req, res) => {
  const event = req.headers['x-github-event'];
  const payload = req.body;

  if (event === 'push') {
    // Command to pull the latest code from GitHub
    const pullCommand = 'git pull origin main'; // Adjust branch as needed

    exec(pullCommand, (err, stdout, stderr) => {
      if (err) {
        console.error('Error pulling code:', stderr);
        return res.status(500).send('Error pulling code');
      }
      console.log('Code pulled successfully:', stdout);
      
      // Optional: Restart your application or perform other deployment steps
      exec('pm2 restart your-app-name', (err, stdout, stderr) => {
        if (err) {
          console.error('Error restarting app:', stderr);
          return res.status(500).send('Error restarting app');
        }
        console.log('App restarted successfully:', stdout);
        res.status(200).send('Deployment successful');
      });
    });
  } else {
    res.status(400).send('Invalid event type');
  }
};