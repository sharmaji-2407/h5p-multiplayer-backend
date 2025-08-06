const fetch = require("node-fetch");

const API_URL = "http://localhost:3001";

async function testGameSession() {
  try {
    console.log("Testing game session creation and joining...\n");

    // Test creating a game session
    console.log("1. Testing game session creation...");
    const createResponse = await fetch(`${API_URL}/api/sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        gameId: "test-game-1",
        userId: "test-user-1",
        userEmail: "test@example.com",
      }),
    });

    const createData = await createResponse.json();
    console.log("Create session response:", createData);

    if (createResponse.ok) {
      const sessionId = createData.sessionId;
      console.log(
        "✅ Session created successfully, sessionId:",
        sessionId,
        "\n"
      );

      // Test joining the game session
      console.log("2. Testing game session joining...");
      const joinResponse = await fetch(
        `${API_URL}/api/sessions/${sessionId}/join`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: "test-user-2",
            userEmail: "test2@example.com",
          }),
        }
      );

      const joinData = await joinResponse.json();
      console.log("Join session response:", joinData);

      if (joinResponse.ok) {
        console.log("✅ Session joined successfully\n");
      } else {
        console.log("❌ Session join failed\n");
      }
    } else {
      console.log("❌ Session creation failed\n");
    }
  } catch (error) {
    console.error("Test failed:", error);
  }
}

testGameSession();
