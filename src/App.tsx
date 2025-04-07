/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import "./App.css";
import axios from "axios";

interface Repo {
  name: string;
  stargazers_count: number;
  id: number;
  description: string;
  forks_count: number;
  html_url: string;
  language: string;
}

function App() {
  const [username, setUsername] = useState("");
  const [profile, setProfile] = useState<any>({});
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showUsernames, setShowUsernames] = useState(false);

  const fetchUserData = async (usernameToFetch: string) => {
    try {
      setError("");
      setLoading(true);
      const url = `https://api.github.com/users/${usernameToFetch}`;
      const repoUrl = `https://api.github.com/users/${usernameToFetch}/repos`;
      const { data } = await axios.get(url);
      const { data: repos } = await axios.get(repoUrl);

      setProfile(data);

      // Get top 5 repos
      const sortedRepos = repos.sort(
        (a: any, b: any) => b.stargazers_count - a.stargazers_count
      );
      const topRepos = sortedRepos.slice(0, 5);
      setRepos(topRepos);

      // Store last 5 searched usernames in local storage
      const storedUsernames = localStorage.getItem("usernames") || "[]";
      const usernames = JSON.parse(storedUsernames);
      if (!usernames.includes(usernameToFetch)) {
        if (usernames.length >= 5) {
          usernames.pop();
        }
        usernames.unshift(usernameToFetch);
        localStorage.setItem("usernames", JSON.stringify(usernames));
      }

      console.log(repos);
    } catch (error: any) {
      console.log(error);

      if (error.response && error.response.status === 404) {
        setError("No user found");
      } else {
        setError("An error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClick = () => {
    if (username.trim()) {
      fetchUserData(username);
    }
  };

  const handleHistoryClick = (historicalUsername: any) => {
    setUsername(historicalUsername);
    fetchUserData(historicalUsername);
  };

  return (
    <div className="w-full px-5">
      <h1 className="text-xl text-center mt-10">GitHub Profile Viewer</h1>

      <div className="flex justify-center mt-10 gap-2">
        <input
          type="text"
          placeholder="Enter GitHub username"
          className="outline-none border p-2"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <button
          onClick={handleClick}
          className="bg-black text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      <div className="text-center mt-4">
        <button
          onClick={() => setShowUsernames(!showUsernames)}
          className="bg-gray-200 px-4 py-2 rounded"
        >
          {showUsernames ? "Hide History" : "See History Searched Names"}
        </button>
      </div>

      {showUsernames && (
        <div>
          <h1 className="text-center mt-10">History</h1>
          <div className="flex flex-wrap justify-center gap-2">
            {JSON.parse(localStorage.getItem("usernames") || "[]").map(
              (historicalUsername: any) => (
                <button
                  key={historicalUsername}
                  onClick={() => handleHistoryClick(historicalUsername)}
                  className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded"
                >
                  {historicalUsername}
                </button>
              )
            )}
          </div>
        </div>
      )}

      {loading ? (
        <h1 className="text-center mt-10">Loading...</h1>
      ) : error ? (
        <h1 className="text-center text-red-500 mt-10">{error}</h1>
      ) : (
        Object.keys(profile).length > 0 && (
          <div>
            <div className="mt-10 p-4 border text-center">
              <h1 className="font-bold text-xl mb-2">User Profile Info</h1>
              <div>
                <img
                  src={profile.avatar_url}
                  alt={`${profile.login}'s avatar`}
                  className="w-20 h-20 rounded-full mx-auto"
                />
                <h2 className="font-bold mt-2">
                  {profile.name || profile.login}
                </h2>
                <p className="text-gray-700 my-2">
                  {profile.bio || "No bio available"}
                </p>
                <p>Followers: {profile.followers}</p>
                <p>Location: {profile.location || "Not specified"}</p>

                <a
                  href={profile.html_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block mt-3 bg-black text-white px-4 py-2 rounded"
                >
                  View Profile
                </a>
              </div>
            </div>

            <div>
              <h1 className="mt-10 p-4 text-center text-xl font-bold">
                Top Repositories
              </h1>
              <div>
                {repos.length > 0 ? (
                  repos.map((repo: Repo) => (
                    <div key={repo.id} className="p-4 border mb-2 rounded">
                      <h2 className="font-bold">{repo.name}</h2>
                      <p className="text-gray-700 my-1">
                        {repo.description || "No description available"}
                      </p>
                      <div className="flex flex-wrap gap-4 mt-2">
                        <p>⭐ Stars: {repo.stargazers_count}</p>
                        <p>🍴 Forks: {repo.forks_count}</p>
                        <p>🔠 Language: {repo.language || "Not specified"}</p>
                      </div>
                      <a
                        href={repo.html_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block mt-2 text-blue-600 hover:underline"
                      >
                        View Repository
                      </a>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500">
                    No repositories found
                  </p>
                )}
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}

export default App;
