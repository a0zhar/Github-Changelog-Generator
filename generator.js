// Helper function that will generate a changelog entry for a single commit:
function generate_markdown_changelog(commitData) {
  let built_markdown = "";

  // If the commit passed only has title, and no additional data,
  // then we print the title only, and return early
  if (commitData.length == 1) {
    return `- ${commitData[0]}<br>`;
  }

  // If the commit contains additional changes
  if (commitData.length > 1) {
    // Then we print them as a list
    commitData.slice(1).forEach((change) => {
      if (change.trim() !== "") {
        // Prevent duplicate lines from being added
        if (!built_markdown.includes(change)) {
          // Check if the additional data dont starts with -
          // if so add it
          if (!change.startsWith("-")) change = `- ${change}`;
          built_markdown += `&nbsp;&nbsp;${change}<br>`;
        }
      }
    });
  }

  return built_markdown;
}

document.getElementById("userinfo").addEventListener("click", function () {
  const username = document.getElementById("username").value;
  const repository = document.getElementById("repoName").value;
  const main_container = document.getElementById("mainform");

  // Check if either one of the input boxes contain no value,
  // and let user know that they should input data, then we
  // return early
  if (username == "" || repository == "") {
    let bak = main_container.innerHTML;
    main_container.innerHTML =
      '<div class="alert alert-warning">One of the Input boxes are empty</div><br>' +
      bak;
    return;
  }

  async function fetchCommits() {
    const response = await fetch(
      `https://api.github.com/repos/${username}/${repository}/commits`
    );
    return await response.json();
  }

  async function displayCommits() {
    const commitsList = document.getElementById("commitsList");
    let current_commit_date = null; // Variable to track the current date of commits
    let changelog = ""; // Variable to store the entire changelog

    try {
      const commits = await fetchCommits();

      commits.forEach((commit) => {
        // Get the date of the current commit
        const commitDate = commit.commit.author.date.toString().slice(0, 10);

        // If the date of the current commit is different from the previous one,
        // start a new "Changes on <date>" section
        if (commitDate !== current_commit_date) {
          if (current_commit_date !== null) {
            // Close the previous "Changes on <date>" section
            changelog += "<br>";
          }
          // Start a new "Changes on <date>" section
          changelog += `### Patches made on (${commitDate})<br><br>`;
          current_commit_date = commitDate;
        }

        // Generate the changelog entry for the current commit and add it to the changelog
        changelog += generate_markdown_changelog(
          commit.commit.message.split("\n")
        );
      });

      // Add the completed changelog to the commitsList element
      commitsList.innerHTML += changelog;
    } catch (error) {
      commitsList.innerHTML =
        '<div class="alert alert-danger">Error fetching commits. Please try again later.</div><br>' +
        bak;
    }
  }

  displayCommits();
});
