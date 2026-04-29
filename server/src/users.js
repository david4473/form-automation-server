const {
  FIXED_BRANCH,
  FIXED_FEEDBACK,
  FIXED_RATING,
  FIXED_STATE,
} = require("./config");

function validateUser(user, index) {
  const requiredFields = ["name", "phone"];

  for (const field of requiredFields) {
    if (!user || typeof user[field] !== "string" || user[field].trim() === "") {
      throw new Error(
        `User at index ${index} is missing required field "${field}"`,
      );
    }
  }
}

function normalizeUsers(payload) {
  const users = Array.isArray(payload)
    ? payload
    : payload && Array.isArray(payload.users)
      ? payload.users
      : null;

  if (!users) {
    throw new Error(
      'Request body must be a users array or an object with a "users" array',
    );
  }

  return users.map((user, index) => {
    validateUser(user, index);

    return {
      name: user.name.trim(),
      phone: user.phone.trim(),
      email: typeof user.email === "string" ? user.email.trim() : "",
      state: FIXED_STATE,
      branch: FIXED_BRANCH,
      rating: FIXED_RATING,
      feedback: FIXED_FEEDBACK,
    };
  });
}

module.exports = {
  normalizeUsers,
};
