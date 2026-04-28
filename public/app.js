(function () {
  const userFields = document.getElementById("user-fields");
  const addUserBtn = document.getElementById("add-user-btn");
  const form = document.getElementById("user-batch-form");
  const loadingState = document.getElementById("loading-state");
  const resultPanel = document.getElementById("result-panel");
  const resultOutput = document.getElementById("result-output");
  const historyList = document.getElementById("history-list");
  const submitBtn = document.getElementById("submit-btn");

  function setLoading(isLoading) {
    loadingState.classList.toggle("hidden", !isLoading);
    submitBtn.disabled = isLoading;
    addUserBtn.disabled = isLoading;

    document.querySelectorAll(".resend-btn").forEach((button) => {
      button.disabled = isLoading;
    });
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function createUserRow(user = {}) {
    const row = document.createElement("div");
    row.className = "user-card";
    row.setAttribute("data-user-row", "");
    row.innerHTML = `
      <button class="close-user-btn" type="button" aria-label="Remove user">
        <span aria-hidden="true">&times;</span>
      </button>
      <div class="user-card-header">
        <h3></h3>
      </div>
      <label>
        <span>Name</span>
        <input name="name" type="text" required value="${escapeHtml(user.name || "")}" />
      </label>
      <label>
        <span>Phone</span>
        <input name="phone" type="text" required value="${escapeHtml(user.phone || "")}" />
      </label>
    `;
    return row;
  }

  function renumberRows() {
    const rows = userFields.querySelectorAll("[data-user-row]");
    rows.forEach((row, index) => {
      const title = row.querySelector("h3");
      if (title) {
        title.textContent = `Customer ${index + 1}`;
      }

      const removeButton = row.querySelector(".close-user-btn");
      if (removeButton) {
        removeButton.hidden = index === 0;
      }
    });
  }

  function collectUsersFromForm() {
    return Array.from(userFields.querySelectorAll("[data-user-row]")).map(
      (row) => {
        return {
          name: row.querySelector('input[name="name"]').value.trim(),
          phone: row.querySelector('input[name="phone"]').value.trim(),
        };
      },
    );
  }

  function renderHistory(history) {
    if (!history.length) {
      historyList.innerHTML =
        '<p class="empty-state">No groups have been submitted yet.</p>';
      return;
    }

    historyList.innerHTML = history
      .map((group, index) => {
        const usersMarkup = group.users
          .map((user) => {
            return `
              <li>
                <strong>${escapeHtml(user.name)}</strong>
                <span>${escapeHtml(user.phone)}</span>
              </li>
            `;
          })
          .join("");

        return `
          <article class="history-card" data-history-id="${escapeHtml(group.id)}">
            <div class="history-card-top">
              <div>
                <h3>Group ${history.length - index}</h3>
                <p class="history-meta">Sent ${new Date(group.createdAt).toLocaleString()}</p>
              </div>
              <button
                class="secondary-btn resend-btn"
                type="button"
                data-users="${encodeURIComponent(JSON.stringify(group.users))}"
              >
                Send again
              </button>
            </div>
            <ul class="history-users">${usersMarkup}</ul>
          </article>
        `;
      })
      .join("");
  }

  async function submitUsers(users) {
    setLoading(true);
    resultPanel.classList.add("hidden");

    try {
      const response = await fetch("/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ users }),
      });

      const payload = await response.json();

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "Submission failed");
      }

      resultOutput.textContent = JSON.stringify(payload, null, 2);
      resultPanel.classList.remove("hidden");

      if (Array.isArray(payload.history)) {
        renderHistory(payload.history);
      }
    } catch (error) {
      resultOutput.textContent = error.message;
      resultPanel.classList.remove("hidden");
    } finally {
      setLoading(false);
    }
  }

  addUserBtn.addEventListener("click", () => {
    userFields.appendChild(createUserRow());
    renumberRows();
  });

  userFields.addEventListener("click", (event) => {
    const removeButton = event.target.closest(".close-user-btn");
    if (!removeButton) {
      return;
    }

    if (userFields.querySelectorAll("[data-user-row]").length === 1) {
      return;
    }

    removeButton.closest("[data-user-row]").remove();
    renumberRows();
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    await submitUsers(collectUsersFromForm());
  });

  historyList.addEventListener("click", async (event) => {
    const button = event.target.closest(".resend-btn");
    if (!button) {
      return;
    }

    const users = JSON.parse(decodeURIComponent(button.dataset.users));
    await submitUsers(users);
  });

  renderHistory(window.__INITIAL_HISTORY__ || []);
  renumberRows();
})();
