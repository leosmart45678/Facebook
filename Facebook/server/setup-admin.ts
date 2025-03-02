import fetch from 'node-fetch';

async function setupAdmin() {
  try {
    // Set specific admin credentials as requested
    const adminUsername = 'SMART';
    const adminPassword = '09163666961';

    console.log(`Setting up admin user: ${adminUsername}`);

    // Try different URLs to ensure connectivity
    const serverUrls = [
      'http://0.0.0.0:5000',
      'http://localhost:5000',
      'http://127.0.0.1:5000'
    ];

    let success = false;
    let lastError = null;

    for (const serverUrl of serverUrls) {
      try {
        console.log(`Trying to connect to server at ${serverUrl}`);

        const response = await fetch(`${serverUrl}/api/admin/setup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            username: adminUsername,
            password: adminPassword
          })
        });

        const data = await response.json();
        console.log('Response status:', response.status);
        console.log('Response data:', data);

        if (response.ok) {
          success = true;
          console.log('Admin user created successfully');
          console.log(`Username: ${adminUsername}`);
          console.log(`Password: ${adminPassword}`);
          break;
        } else {
          console.log(`Failed with server ${serverUrl}:`, data.message);
          lastError = data.message;
        }
      } catch (err) {
        console.log(`Error connecting to ${serverUrl}:`, err.message);
        lastError = err.message;
      }
    }

    if (!success) {
      console.error('Failed to create admin user:', lastError);
      process.exit(1);
    }
  } catch (error) {
    console.error('Error setting up admin:', error);
    process.exit(1);
  }
}

setupAdmin();