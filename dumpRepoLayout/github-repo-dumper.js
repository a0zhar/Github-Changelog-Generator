document.getElementById("repo-form").addEventListener("submit", handleFormSubmit);

async function handleFormSubmit(event) {
  event.preventDefault();

  let owner = document.getElementById("username").value;
  let repo = document.getElementById("repository").value;

  if (!owner || !repo) {
    alert("Please enter both GitHub username and repository name.");
    return;
  }

  try {
    let contents = await fetchRepoStructure(owner, repo);
    let formattedStructure = await formatStructure(owner, repo, contents);

    displayStructure(formattedStructure);
  } catch (error) {
    handleError(error);
  }
}

async function fetchRepoStructure(owner, repo, path = "") {
  let url = `https://api.github.com/repos/${owner}/${repo}/contents${path}`;
  let response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch contents from ${url}`);
  }

  return response.json();
}

async function formatStructure(owner, repo, contents, path = "", level = 0) {
  let result = "";
  let indentation = "   ".repeat(level);

  for (let item of contents) {
    if (item.type === "dir") {
      result += `${indentation}- ${item.name}/\n`;

      try {
        const subContents = await fetchRepoStructure(owner, repo, `${path}${item.name}/`);
        result += await formatStructure(owner, repo, subContents, `${path}${item.name}/`, level + 1);
      } catch (error) {
        console.error(`Error fetching contents for ${path}${item.name}/:`, error);
      }
    } else if (item.type === "file") {
      result += `${indentation}- ${item.name}\n`;
    }
  }

  return result;
}

function displayStructure(structure) {
  document.getElementById("repo-structure").innerHTML = structure;
}

function handleError(error) {
  console.error("Error fetching repository structure:", error);
  document.getElementById("repo-structure").innerHTML = "Error fetching repository structure.";
}
