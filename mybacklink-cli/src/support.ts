export const SUPPORT_ISSUE_URL =
	"https://github.com/hekmon8/mybacklinks-tools/issues";

export function getSupportIssueHint() {
	return `Support: report CLI bugs, rough edges, or feature requests at ${SUPPORT_ISSUE_URL}`;
}

export function printSupportIssueHint() {
	process.stderr.write(`\n${getSupportIssueHint()}\n`);
}
