const fetch = require("node-fetch");

const API_URL = "http://localhost:3001";

async function testAuth() {
  try {
    console.log("Testing authentication system...\n");

    // Test registration
    console.log("1. Testing user registration...");
    const registerResponse = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: "test-user-1",
        email: "test@example.com",
        password: "password123",
      }),
    });

    const registerData = await registerResponse.json();
    console.log("Registration response:", registerData);

    if (registerResponse.ok) {
      const token = registerData.token;
      console.log("✅ Registration successful, token received\n");

      // Test login
      console.log("2. Testing user login...");
      const loginResponse = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "test@example.com",
          password: "password123",
        }),
      });

      const loginData = await loginResponse.json();
      console.log("Login response:", loginData);

      if (loginResponse.ok) {
        console.log("✅ Login successful\n");

        // Test protected route
        console.log("3. Testing protected route...");
        const meResponse = await fetch(`${API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const meData = await meResponse.json();
        console.log("Protected route response:", meData);

        if (meResponse.ok) {
          console.log("✅ Protected route access successful\n");
        } else {
          console.log("❌ Protected route access failed\n");
        }
      } else {
        console.log("❌ Login failed\n");
      }
    } else {
      console.log("❌ Registration failed\n");
    }
  } catch (error) {
    console.error("Test failed:", error);
  }
}

testAuth();
