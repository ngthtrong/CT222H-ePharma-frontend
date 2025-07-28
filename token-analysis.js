// Test token analysis
const oldToken = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbjFAYWRtaW4uY29tIiwidXNlcklkIjoiNjg4NThkOTQ2NzNjYjczMWQ2Yzc1ODZkIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzUzNjY4NjMzLCJleHAiOjE3NTM2NzIyMzN9.hvkWviRDFg7IYTVw7gtsh3hq2jmPbQ1KzZKA0MwQ3HU";
const newToken = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbjFAYWRtaW4uY29tIiwidXNlcklkIjoiNjg4NThkOTQ2NzNjYjczMWQ2Yzc1ODZkIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzUzNjY5NDE5LCJleHAiOjE3NTM2NzMwMTl9.ZBb6gVkNLv8895GO2F0jv5ngUWdmbng8rvX3SW1wSbg";

console.log("=== TOKEN ANALYSIS ===");

const decodeJWT = (token) => {
  try {
    const parts = token.split('.');
    const payload = parts[1];
    return JSON.parse(atob(payload));
  } catch (error) {
    return null;
  }
};

const oldPayload = decodeJWT(oldToken);
const newPayload = decodeJWT(newToken);

console.log("Old Token:");
console.log("- IAT (Issued At):", new Date(oldPayload.iat * 1000).toISOString());
console.log("- EXP (Expires):", new Date(oldPayload.exp * 1000).toISOString());
console.log("- Current Time:", new Date().toISOString());
console.log("- Is Expired:", oldPayload.exp < Math.floor(Date.now() / 1000));

console.log("\nNew Token:");
console.log("- IAT (Issued At):", new Date(newPayload.iat * 1000).toISOString());
console.log("- EXP (Expires):", new Date(newPayload.exp * 1000).toISOString());
console.log("- Current Time:", new Date().toISOString());
console.log("- Is Expired:", newPayload.exp < Math.floor(Date.now() / 1000));

console.log("\nTime Difference:");
console.log("- IAT difference:", (newPayload.iat - oldPayload.iat), "seconds");
console.log("- EXP difference:", (newPayload.exp - oldPayload.exp), "seconds");

console.log("\nConclusion:");
console.log("Old token was issued earlier and likely invalidated when new token was created");
console.log("New token is fresh and active");
