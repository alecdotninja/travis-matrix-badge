const TRAVIS_CI_API_ENDPOINT = 'https://api.travis-ci.org';
const { default: fetch } = require('node-fetch');

exports.handler = async ({ queryStringParameters }) => {
    const { owner, project, branch } = queryStringParameters;

    if (!owner || !project) {
        return {
            statusCode: 400
        };
    }

    const buildId = await fetchLatestBuildId(owner, project, branch);

    if (!buildId) {
        return {
            statusCode: 404
        };
    }

    const build = await fetchBuild(buildId);
    const jobs = await Promise.all(build.job_ids.map(jobId => fetchJob(jobId)));
    
    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'image/svg+xml',
        },
        body: renderSVG(jobs.map(job => `${job.config.name || `#${job.number}`}: ${job.state}`)),
    };
};

function renderSVG(lines) {
    return (
        `<svg xmlns="http://www.w3.org/2000/svg">` +
            `<text x="0" y="-1em" dominant-baseline="hanging" text-anchor="start">` +
                lines.map(line => `<tspan x="0" dy="1em">${line}</tspan>`).join('') +
            `</text>` +
        `</svg>`
    );
}

async function fetchLatestBuildId(owner, project, branch = null) {
    if (branch) {
        return fetchLatestBuildIdForBranch(owner, project, branch);
    } else {
        return fetchLatestBuildIdForProject(owner, project);
    }

}

async function fetchLatestBuildIdForBranch(owner, project, branch) {
    const response = await fetchTravisResource(
        `repos/${encodeURIComponent(owner)}/${encodeURIComponent(project)}` +
        `/branches/${encodeURIComponent(branch)}`
    );

    if (response.branch) {
        return response.branch.id;
    } else {
        return null;
    }
}

async function fetchLatestBuildIdForProject(owner, project) {
    const response = await fetchTravisResource(`repos/${encodeURIComponent(owner)}/${encodeURIComponent(project)}`);

    if (response.repo) {
        return response.repo.last_build_id;
    } else {
        return null;
    }
}

async function fetchBuild(buildId) {
    const response = await fetchTravisResource(`builds/${encodeURIComponent(buildId)}`);

    if (response.build) {
        return response.build;
    } else {
        return null;
    }
}

async function fetchJob(jobId) {
    const response = await fetchTravisResource(`jobs/${encodeURIComponent(jobId)}`);

    if (response.job) {
        return response.job;
    } else {
        return null;
    }
}

async function fetchTravisResource(path) {
    const response = await fetch(`${TRAVIS_CI_API_ENDPOINT}/${path}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/vnd.travis-ci.2.1+json'
        },
    });

    return response.json();
}