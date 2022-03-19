# Updated MangaDex discord webhook with Google Script
Inspired [GuilhermeFaga's version](https://www.google.com) but implemented in MangaDex's v5 API.

The output in Discord:

![Example](https://cdn.discordapp.com/attachments/954683733921923115/954766999291039824/unknown.png)


# Installation
## Prerequisites
- MangaDex Account
- Google Account

## Steps
### Creating an MDList
- Login to your account and create a **public** [MDList](https://mangadex.org/create/list)

![MDList](https://cdn.discordapp.com/attachments/954683733921923115/954782476365074482/unknown.png)


- Add manga to be tracked to the list through the `Add to MDList` on the manga page

![Add to MDList](https://cdn.discordapp.com/attachments/954683733921923115/954782027146727445/unknown.png)

### Creating a Google Sheets

- Create a [Google Sheets](https://sheets.new/)
- Create two sheets `feeds` and `webhooks` (Case sensitive)

![Add sheet](https://cdn.discordapp.com/attachments/954683733921923115/954782209208877147/unknown.png)

- Copy the `id` of your list (from the url)

![id](https://cdn.discordapp.com/attachments/954683733921923115/954784457620062208/unknown.png)

- In the `feeds` sheet, paste the `id` in the first column (multiple feeds can be pasted; also note, columns other than the first can have any text, useful for identifying which ID is which)

![sneed feed](https://cdn.discordapp.com/attachments/954683733921923115/954783493492183160/unknown.png)

- Open App Script through `Extensions` -> `App Script`

![App Script](https://cdn.discordapp.com/attachments/954683733921923115/954776144622788648/unknown.png)

- Paste in [`Code.gs`](./Code.gs)

![Code gs](https://cdn.discordapp.com/attachments/954683733921923115/954776823877763182/unknown.png)

- Create a new `Script` called helper.gs
- Paste in the code from [`helper.gs`](./helper.gs)
- Create a new `Trigger`

![Triggers](https://cdn.discordapp.com/attachments/954683733921923115/954777934663671838/unknown.png)

- With the following settings: `function: main`, `event source: Time-driven`, `type of time: Minutes timer`, `Select minute interval: Every 10 minutes`

![settings](https://cdn.discordapp.com/attachments/954683733921923115/954779014344634458/unknown.png)

### Creating a Discord WebHook
- Open server settings

![server settings](https://cdn.discordapp.com/attachments/954683733921923115/954779805176434728/unknown.png)

- Go to `Integrations -> Webhooks -> New Webhook` and copy it's url

![new webhook](https://cdn.discordapp.com/attachments/954683733921923115/954780352533123152/unknown.png)

- The url should look like: https://discord.com/api/webhooks/954780574910939239/8kOKc413vL0CvxqsYtA8CUtZ0Hse8U3fTWiNqv42NWUymxV0k4_Rqya6oeGeA48JgYks

- Paste the link into the first column in the `webhooks` sheet

![webhooks sheets](https://cdn.discordapp.com/attachments/954683733921923115/954780782843559976/unknown.png)


## Customisation
- At the moment only the `Trigger Interval` and Target Language can be changed through modifying the script

### Target Language
- Modifying `line 5` of `Code.gs` will change the target language which the script detects

![lang](https://cdn.discordapp.com/attachments/954683733921923115/954786131461935124/unknown.png)

- `LANGUAGE` can be changed to any of the values specified by [MangaDex's API](https://api.mangadex.org/docs.html#section/Language-Codes-and-Localization)

![possible lang](https://cdn.discordapp.com/attachments/954683733921923115/954785007296200775/unknown.png)

### Trigger Interval
- Modifying `line 2` of `Code.gs` will change the interval at which new chapters are polled (in minutes)
![TRIGGER_INTERVAL](https://cdn.discordapp.com/attachments/954683733921923115/954786692408148048/unknown.png)
- **However, the trigger interval should also be modified in the `Google Script`**
![script image](https://media.discordapp.net/attachments/954683733921923115/954779014344634458/unknown.png?width=574&height=642)
