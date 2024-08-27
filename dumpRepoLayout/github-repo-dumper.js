document.addEventListener("DOMContentLoaded", function() {
  // Attach a submit event listener to the form after the page has fully loaded
  document.getElementById("repo-form").addEventListener("submit", handleFormSubmit);

  // Handles form submission, validates inputs, fetches and displays the repo structure
  function handleFormSubmit(event) {
    event.preventDefault(); // Prevent form from submitting the usual way

    let owner = document.getElementById("username").value; // Get GitHub username
    let repo = document.getElementById("repository").value; // Get repository name

    // Check if both input fields are filled
    if (!owner || !repo) {
      alert("Please enter both GitHub username and repository name.");
      return; // Stop execution if either field is empty
    }

    // Fetch and format the repository structure
    fetchRepoStructure(owner, repo, "", function(error, contents) {
      if (error) {
        handleError(error); // Handle any errors that occur during the process
      } else {
        formatStructure(owner, repo, contents, "", 0, function(formattedStructure) {
          // Display the formatted repository structure on the page
          displayStructure(formattedStructure);
        });
      }
    });
  }

  // Fetch the contents of a GitHub repository from the GitHub API
  function fetchRepoStructure(owner, repo, path = "", callback) {
    let url = `https://api.github.com/repos/${owner}/${repo}/contents${path}`; // API URL
    let xhr = new XMLHttpRequest(); // Create a new XMLHttpRequest object

    // Configure the request
    xhr.open("GET", url, true);

    // Set up a function to handle the response data
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) { // Request is complete
        if (xhr.status === 200) { // Request was successful
          callback(null, JSON.parse(xhr.responseText)); // Parse and return the JSON response
        } else {
          callback(new Error(`Failed to fetch contents from ${url}`)); // Pass error to callback
        }
      }
    };

    xhr.send(); // Send the request
  }

  // Recursively format the repository structure as a markdown-style list
  function formatStructure(owner, repo, contents, path = "", level = 0, callback) {
    let result = ""; // Initialize the result string
    let indentation = "   ".repeat(level); // Indentation for nested items

    let remaining = contents.length; // Track how many items are left to process
    if (remaining === 0) callback(result); // If no contents, return immediately

    // Iterate over each item in the repository contents
    contents.forEach(function(item) {
      if (item.type === "dir") {
        // If the item is a directory, add it to the result with a trailing slash
        result += `${indentation}- ${item.name}/\n`;

        // Fetch and format the contents of the directory recursively
        fetchRepoStructure(owner, repo, `${path}${item.name}/`, function(error, subContents) {
          if (error) {
            console.error(`Error fetching contents for ${path}${item.name}/:`, error); // Log any errors
          } else {
            formatStructure(owner, repo, subContents, `${path}${item.name}/`, level + 1, function(subResult) {
              result += subResult; // Add the subdirectory structure to the result
              remaining--;
              if (remaining === 0) callback(result); // Call the callback when done
            });
          }
        });
      } else if (item.type === "file") {
        // If the item is a file, add it to the result without a trailing slash
        result += `${indentation}- ${item.name}\n`;
        remaining--;
        if (remaining === 0) callback(result); // Call the callback when done
      }
    });
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
