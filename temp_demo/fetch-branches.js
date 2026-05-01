async function getBranches() {
  const res = await fetch("https://api.github.com/repos/DSUC-Project/DSUC-Labs/branches");
  const data = await res.json();
  console.log(data);
}
getBranches();
