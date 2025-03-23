function findMailCount(htmlBody) {
  const patterns = [
    /<span id="total-mailpieces[^"]*">(\d+)<\/span>/i,
    /<span id="bg-total-mailpieces[^"]*">(\d+)<\/span>/i,
    /You have (\d+) mailpiece\(s\) and/i,
    /<h1[^>]*>(\d+)<\/h1>\s*<p[^>]*>\s*<strong>Mailpiece\(s\)<\/strong>/i
  ];

  for (const pattern of patterns) {
    const match = htmlBody.match(pattern);
    if (match) return parseInt(match[1]);
  }
  return 0;
}

function extractMailCount(notes) {
  if (!notes) return 0;
  const match = notes.match(/Mail pieces: (\d+)/);
  return match ? parseInt(match[1]) : 0;
}

function createMailPickupTasks() {
  try {
    // Get today's mail count
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const searchQuery = 'from:USPSInformeddelivery@email.informeddelivery.usps.com ' +
                       'subject:"Your Daily Digest" ' +
                       `after:${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()}`;
    
    const threads = GmailApp.search(searchQuery);
    let newMailCount = 0;
    
    // Find first valid mail notification
    threadLoop: for (const thread of threads) {
      for (const message of thread.getMessages()) {
        const htmlBody = message.getBody();
        if (!htmlBody) continue;
        
        newMailCount = findMailCount(htmlBody);
        if (newMailCount === 0) continue;
        
        const attachments = message.getAttachments();
        const allAreAds = attachments.length > 0 && 
                         attachments.every(att => {
                           const name = att.getName();
                           return name.startsWith("mailer-") || name.startsWith("content-");
                         });
        
        if (!allAreAds) break threadLoop;
      }
    }
    
    if (newMailCount === 0) return;
    
    // Get active tasks
    const taskList = Tasks.Tasklists.list().items[0];
    if (!taskList) throw new Error('No task list found');
    
    const activeTasks = Tasks.Tasks.list(taskList.id, {
      showHidden: false,
      maxResults: 100,
      status: 'needsAction'
    });
    
    // Find active mail pickup tasks
    const mailTasks = (activeTasks.items || [])
      .filter(task => task.title === "Pick up mails (after 6pm)");
    
    // Calculate total from all active tasks
    const totalMailCount = mailTasks.reduce((sum, task) => 
      sum + extractMailCount(task.notes), newMailCount);
    
    const taskDate = new Date();
    taskDate.setHours(0, 0, 0, 0);
    
    const taskDetails = {
      title: "Pick up mails (after 6pm)",
      notes: `Mail pieces: ${totalMailCount}\nCreated from USPS Informed Delivery notification`,
      due: taskDate.toISOString(),
      status: "needsAction"
    };
    
    if (mailTasks.length > 0) {
      // Update first task, remove others if any
      Tasks.Tasks.patch(taskDetails, taskList.id, mailTasks[0].id);
      
      // Delete any additional active tasks
      mailTasks.slice(1).forEach(task => 
        Tasks.Tasks.remove(taskList.id, task.id)
      );
    } else {
      // Create new task
      Tasks.Tasks.insert(taskDetails, taskList.id);
    }
    
  } catch (error) {
    console.error('Error in createMailPickupTasks:', error);
    throw error;
  }
}