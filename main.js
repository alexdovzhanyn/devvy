const https = require('https')

const sendMessage = message => new Promise((res, rej) => {
  let req = https.request({
    hostname: 'api.telegram.org',
    port: 443,
    path: `/bot${process.env.TG_API_KEY}/sendMessage`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  }, done => res())
    
  req.on('error', e => rej(e))
  
  const msg = JSON.stringify({
    chat_id: '@ElixiumDevelopers',
    text: message,
    parse_mode: "Markdown"
  })
  
  req.end(msg)
})

const handleIssue = ({action, issue, repository}) => {
  switch(action) {
    case 'opened':
    case 'reopened':
      return `[Issue #${issue.number}](${issue.url}) opened in \`${repository.full_name}\`: \n\n *${issue.title}*  \n\n \`\`\` ${issue.body} \`\`\``
    case 'closed':
      return `[Issue #${issue.number}](${issue.url}) closed in \`${repository.full_name}\``
  }
}

const handleIssueComment = ({action, issue, comment, repository}) => {
  if (action != 'created') return
  
  return `New comment on [Issue #${issue.number}](${issue.url}) in \`${repository.full_name}\` by \`${comment.user.login}\`: \`\`\` ${comment.body} \`\`\``
}

const handleStar = ({repository, sender}) => {
  return `\`${sender.login}\` starred \`${repository.full_name}\``
}

const handlePR = ({action, repository, pull_request, sender}) => {
  switch(action) {
    case 'opened':
    case 'reopened':
      return `[Pull request #${pull_request.number}](${pull_request.url}) opened in \`${repository.full_name}\` by \`${sender.login}\`: \n\n *${pull_request.title}* \n\n \`\`\` ${pull_request.body} \`\`\``
    case 'closed':
      return `[Pull request #${pull_request.number}](${pull_request.url}) closed in \`${repository.full_name}\` by \`${sender.login}\``
  }
}

const handleEvent = async (name, body) => {
  let payload = JSON.parse(body)
  
  switch(name) {
    case 'issues':
      return await sendMessage(handleIssue(payload))
    case 'issue_comment':
      return await sendMessage(handleIssueComment(payload))
    case 'watch':
      return await sendMessage(handleStar(payload))
    case 'pull_request':
      return await sendMessage(handlePR(payload))
    default:
      return await sendMessage(name)
  }
}

exports.handler = async event => {
  await handleEvent(event.headers["X-GitHub-Event"], event.body)
  return {status: 200}
}
