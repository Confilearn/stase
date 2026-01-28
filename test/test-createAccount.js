const testCreateAccount = async () => {
  try {
    const response = await fetch("http://localhost:8081/api/createAccount", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        firstName: "John",
        lastName: "Doe",
        username: "johndoe",
        email: "john.doe@example.com",
      }),
    });

    const data = await response.json();
    console.log("Status:", response.status);
    console.log("Response:", JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error:", error);
  }
};

testCreateAccount();
