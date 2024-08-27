document.addEventListener("DOMContentLoaded", function() {
  // Attach a submit event listener to the form after the page has fully loaded
  document.getElementById("repo-form").addEventListener("submit", handleFormSubmit);

  // Handles form submission, validates inputs, fetches and displays the repo structure
  async function handleFormSubmit(event) {
    event.preventDefault(); // Prevent form from submitting the usual way

    let owner = document.getElementById("username").value; // Get GitHub username
    let repo = document.getElementById("repository").value; // Get repository name

    // Check if both input fields are filled
    if (!owner || !repo) {
      alert("Please enter both GitHub username and repository name.");
      return; // Stop execution if either field is empty
    }

    try {
      // Fetch and format the repository structure
      let contents = await fetchRepoStructure(owner, repo);
      let formattedStructure = await formatStructure(owner, repo, contents);

      // Display the formatted repository structure on the page
      displayStructure(formattedStructure);
    } catch (error) {
      handleError(error); // Handle any errors that occur during the process
    }
  }

  // Fetch the contents of a GitHub repository from the GitHub API
  async function fetchRepoStructure(owner, repo, path = "") {
    let url = https://api.github.com/repos/${owner}/${repo}/contents${path}; // API URL
    let response = await fetch(url); // Make the API request

    // If the request fails, throw an error
    if (!response.ok) {
      throw new Error(Failed to fetch contents from ${url});
    }

    return response.json(); // Return the parsed JSON response
  }

  // Recursively format the repository structure as a markdown-style list
  async function formatStructure(owner, repo, contents, path = "", level = 0) {
    let result = ""; // Initialize the result string
    let indentation = "   ".repeat(level); // Indentation for nested items

    // Iterate over each item in the repository contents
    for (let item of contents) {
      if (item.type === "dir") {
        // If the item is a directory, add it to the result with a trailing slash
        result += ${indentation}- ${item.name}/\n;

        try {
          // Fetch and format the contents of the directory recursively
          const subContents = await fetchRepoStructure(owner, repo, ${path}${item.name}/);
          result += await formatStructure(owner, repo, subContents, ${path}${item.name}/, level + 1);
        } catch (error) {
          console.error(Error fetching contents for ${path}${item.name}/:, error); // Log any errors
        }
      } else if (item.type === "file") {
        // If the item is a file, add it to the result without a trailing slash
        result += ${indentation}- ${item.name}\n;
      }
    }

    return result; // Return the formatted result
  }

  // Display the formatted structure in the output container
  function displayStructure(structure) {
    document.getElementById("repo-structure").innerHTML = structure;
  }

  // Handle errors by logging them and displaying a message on the page
  function handleError(error) {
    console.error("Error fetching repository structure:", error); // Log the error
    document.getElementById("repo-structure").innerHTML = "Error fetching repository structure."; // Display error message
  }
});
