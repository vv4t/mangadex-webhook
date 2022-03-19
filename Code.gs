
const TRIGGER_INTERVAL = 10;

const API_URL = "https://api.mangadex.org";
const LANGUAGE = "en";

function main() {
  const webhooks = get_array_from_sheets("webhooks", columns = 1);
  const feeds = get_array_from_sheets("feeds", columns = 1);

  const updates = check_feed_updates(feeds);

  for (const webhook of webhooks)
    for (const update of updates)
      post_webhook(webhook, update);
}

function check_feed_updates(feed_ids)
{
  const updates = [];
  for (const feed_id of feed_ids) {
    const previous_check = new Date(Date.now() - TRIGGER_INTERVAL * 60000);
    const str_previous_check = previous_check.toISOString().substring(0, previous_check.toISOString().indexOf('.'));
    
    const feed_parameters = "?translatedLanguage[]=" + LANGUAGE + "&createdAtSince=" + str_previous_check;
    const feed_url = API_URL + "/list/" + feed_id + "/feed" + feed_parameters;
    
    const feed = request(feed_url);

    for (const chapter of feed.data) {
      const scanlation_group_url = API_URL + "/group/" + get_type_id(chapter, "scanlation_group");
      const scanlation_group = request(scanlation_group_url, "GET");

      const manga_url = API_URL + "/manga/" + get_type_id(chapter, "manga");
      const manga = request(manga_url, "GET");

      const author_url = API_URL + "/author/" + get_type_id(manga.data, "author");
      const author = request(author_url, "GET");
      
      const cover_url = API_URL + "/cover/" + get_type_id(manga.data, "cover_art");
      const cover = request(cover_url, "GET");
      
      const author_name = author.data.attributes.name;
      const scanlation_group_name = scanlation_group != null ? scanlation_group.data.attributes.name : "No Group";
      const chapter_title = chapter.attributes.title != null ? chapter.attributes.title : "";

      const thumbnail_url = "https://uploads.mangadex.org/covers/" + manga.data.id + "/" + cover.data.attributes.fileName;
      
      const payload = {
        "embeds": [
          {
            "title": "Ch." + chapter.attributes.chapter + " - " + manga.data.attributes.title.en,
            "description": chapter_title + "\nAuthor: " + author_name + "\nGroup: " + scanlation_group_name,
            "color": 16742144,
            "footer": {
              "text": "New update available"
            },
            "url": "https://mangadex.org/chapter/" + chapter.id,
            "timestamp": chapter.attributes.createdAt,
            "thumbnail": {
              "url": thumbnail_url
            }
          }
        ]
      };
      
      updates.push(payload);
    }
  }

  return updates;
}

function post_webhook(webhook, payload)
{
  request(webhook, "POST", payload);
}

function get_type_id(item, type)
{
  for (const relationship of item.relationships)
    if (relationship.type == type)
      return relationship.id;
  
  return null;
}
