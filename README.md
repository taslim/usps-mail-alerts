# USPS Mail Alerts

## Overview

A Google Apps Script project that automatically creates Google Tasks reminders for mail pickup based on USPS Informed Delivery emails. This script monitors your Gmail for these notifications, creates tasks to remind you to pick up your mail, and tracks the number of mail pieces waiting for pickup.

## How It Works

The script automatically:

- Searches your Gmail for daily USPS Informed Delivery digest emails
- Extracts the number of mail pieces expected to be delivered
- Creates a "Pick up mails (after 6pm)" task in your default Google Tasks list
- Updates existing tasks rather than creating duplicates when mail accumulates over multiple days
- Tracks the total count of mail pieces waiting for pickup
- Ignores emails that only contain advertisements

If you already have an active "Pick up mails" task, the script will update that task with the accumulated mail count instead of creating a new one.

## Requirements

- A Google account
- USPS Informed Delivery subscription (free service from USPS)
- Google Tasks enabled

## Installation

1. Create a new Google Apps Script project at [script.google.com](https://script.google.com/)
2. Copy the contents of `Code.js` into the script editor
3. Enable the Google Tasks API:
   - In the Apps Script editor, go to Services (+)
   - Select "Tasks API" from the list
   - Click "Add"
4. Save the project and set up time-driven trigger

## Setting Up a Trigger

For automatic daily checking:

1. In the Apps Script editor, go to Triggers (clock icon)
2. Click "Add Trigger"
3. Set:
   - Function to run: `createMailPickupTasks`
   - Event source: "Time-driven"
   - Type of time: "Day timer" 
   - Time of day: Pick a time after your USPS Informed Delivery emails typically arrive. I have mine set for 8am - 9am because the emails typically arrive around 7am for me.

## Privacy Note

This script runs in your Google account and only processes your own emails and tasks. No data is sent to external servers.

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. 
