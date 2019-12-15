const { default: fetch } = require('node-fetch');

exports.handler = async ({ queryStringParameters }) => {
    const { owner, repo, branch, columns, width } = queryStringParameters;

    if (!owner || !repo) {
        return renderFailure(400, 'An owner and repo must be specified.');
    }

    const latestJobs = await fetchLatestJobs(owner, repo, branch);
    
    if (!latestJobs) {
        return renderFailure(404, 'The build status for the provided owner and repo could not be found.');
    }

    return renderMatrix(latestJobs, columns, width);
};

function renderFailure(statusCode, message) {
    return {
        statusCode,
        headers: { 'Content-Type': 'image/svg+xml' },
        body: (
            `<svg xmlns="http://www.w3.org/2000/svg">` +
                `<text x="0" y="0" dominant-baseline="hanging" text-anchor="start">` +
                    svgEscape(message) +
                `</text>` +
            `</svg>`
        ),
    };
}

const MATRIX_STYLE = {
    width: 820,
    columns: 3,
    rowHeight: 36,
    cellSpacing: 4,
};

const GREY_MATRIX_ENTRY_STYLE = {
    padding: 6,
    accentWidth: 6,
    borderWidth: 1,
    borderColor: "#eff0ec",
    textColor: "#666",
    backgroundColor: "#f1f1f1",
    accentColor: "#9d9d9d",
};

const RED_MATRIX_ENTRY_STYLE = {
    ...GREY_MATRIX_ENTRY_STYLE,
    backgroundColor: "#fce8e2",
    accentColor: "#db4545",
};

const YELLOW_MATRIX_ENTRY_STYLE = {
    ...GREY_MATRIX_ENTRY_STYLE,
    backgroundColor: "#faf6db",
    accentColor: "#cdb62c",
};

const GREEN_MATRIX_ENTRY_STYLE = {
    ...GREY_MATRIX_ENTRY_STYLE,
    backgroundColor: "#deecdc",
    accentColor: "#39aa56",
};

const MATRIX_ENTRY_STYLE_BY_JOB_STATE = {
    canceled: GREY_MATRIX_ENTRY_STYLE,
    failed: RED_MATRIX_ENTRY_STYLE,
    errored: RED_MATRIX_ENTRY_STYLE,
    received: YELLOW_MATRIX_ENTRY_STYLE,
    queued: YELLOW_MATRIX_ENTRY_STYLE,
    created: YELLOW_MATRIX_ENTRY_STYLE,
    booting: YELLOW_MATRIX_ENTRY_STYLE,
    started: YELLOW_MATRIX_ENTRY_STYLE,
    passed: GREEN_MATRIX_ENTRY_STYLE,
};

function renderMatrix(jobs, columns = null, width = null) {
    const entries = jobs.map(job => {
        const { state, number, config: { name } } = job;

        return {
            text: name || `#${number}`,
            style: MATRIX_ENTRY_STYLE_BY_JOB_STATE[state] || GREY_MATRIX_ENTRY_STYLE,
        };
    });

    let thisMatrixStyle = { ...MATRIX_STYLE };

    if (width) {
        thisMatrixStyle.width = width;
    }

    if (columns) {
        thisMatrixStyle.columns = columns;
    }

    return {
        statusCode: 200,
        headers: { 'Content-Type': 'image/svg+xml' },
        body: drawMatrix(entries, thisMatrixStyle),
    };
}

function drawMatrix(entries, style) {
    const { columns, width, rowHeight, cellSpacing } = style;

    const totalcellSpacing = (columns + 1) * cellSpacing;
    const totalRowWidth = width - totalcellSpacing;
    const rowWidth = totalRowWidth / columns;

    let buffer = '';
    let cursorX = 0;
    let cursorY = 0;
    
    entries.forEach(({ text, style }, index) => {
        const isLastColumn = (index % columns === columns - 1);

        buffer += drawMatrixEntry(
            cursorX + cellSpacing,
            cursorY + cellSpacing,
            rowWidth,
            rowHeight,
            text,
            style
        );

        cursorX += cellSpacing + rowWidth;

        if (isLastColumn) {
            cursorX = 0;
            cursorY += cellSpacing + rowHeight;
        }
    });

    const height = cursorY + cellSpacing;

    return (
        `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">` +
            buffer +
        `</svg>`
    );
}

function drawMatrixEntry(x, y, width, height, text, style) {
    const {
        padding, accentWidth, borderWidth,
        textColor, backgroundColor, accentColor, borderColor,
    } = style;

    const textSize = height - padding * 2;
    const textAnchorTop = height / 2;
    const textOffsetLeft = accentWidth + padding;

    return (
        `<g>` +
            `<rect x="${x}" y="${y}" width="${width}" height="${height}" ` + 
                `fill="${backgroundColor}" stroke-width="${borderWidth}" stroke="${borderColor}"></rect>` +
            `<rect x="${x}" y="${y}" width="${accentWidth}" height="${height}" ` +
                `fill="${accentColor}" stroke="${accentColor}"></rect>` +
            `<text ` +
                `x="${x+textOffsetLeft}" y="${y+textAnchorTop}" dominant-baseline="middle" text-anchor="start" ` +
                `font-size="${textSize}" font-family="sans-serif" fill="${textColor}">${svgEscape(text)}</text>` +
        `</g>`
    );
}

function svgEscape(unsafe) {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}

async function fetchLatestJobs(owner, repo, branch = null) {
    const latestBuild = await fetchLatestBuild(owner, repo, branch);
    const latestJobIds = latestBuild && latestBuild.job_ids;
    return latestJobIds && Promise.all(latestJobIds.map(fetchJob));
}

async function fetchLatestBuild(owner, repo, branch = null) {
    const latestBuildId = await fetchLatestBuildId(owner, repo, branch);
    return latestBuildId && fetchBuild(latestBuildId);
}

async function fetchLatestBuildId(owner, repo, branch = null) {
    if (branch) {
        const branchObj = await fetchBranch(owner, repo, branch);
        return branchObj && branchObj.id;
    } else {
        const repoObj = await fetchRepo(owner, repo);
        return repoObj && repoObj.last_build_id;
    }
}

async function fetchBranch(owner, repo, branch) {
    const response = await fetchTravisResource(branchPath(owner, repo, branch));
    return response && response.branch;
}

function branchPath(owner, repo, branch) {
    return `${repoPath(owner, repo)}/branches/${encodeURIComponent(branch)}`;
}

async function fetchRepo(owner, repo) {
    const response = await fetchTravisResource(repoPath(owner, repo));
    return response && response.repo;
}

function repoPath(owner, repo) {
    return `repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
}

async function fetchBuild(buildId) {
    const response = await fetchTravisResource(buildPath(buildId));
    return response && response.build;
}

function buildPath(buildId) {
    return `builds/${encodeURIComponent(buildId)}`;
}

async function fetchJob(jobId) {
    const response = await fetchTravisResource(jobPath(jobId));
    return response && response.job;
}

function jobPath(jobId) {
    return `jobs/${encodeURIComponent(jobId)}`;
}

const TRAVIS_CI_API_ENDPOINT = 'https://api.travis-ci.org';

async function fetchTravisResource(path) {
    const response = await fetch(`${TRAVIS_CI_API_ENDPOINT}/${path}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/vnd.travis-ci.2.1+json'
        },
    });

    return response.json();
}