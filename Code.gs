
const TRIGGER_INTERVAL = 10;

const API_URL = "https://api.mangadex.org";
const LANGUAGE = "en";

function main() {
  const webhooks = get_array_from_sheets("webhooks", columns = 2);
  const feeds = get_array_from_sheets("feeds", columns = 1).map(x => x[0]);
  const refresh_tokens = get_array_from_sheets("accounts", columns = 1).map(x => x[0]);

  const updates = [];

  for (const refresh_token of refresh_tokens) {
    const access_token = refresh_session(refresh_token);

    if (access_token) {
      const follow_updates = check_follow_feed_updates(access_token);
      updates.push(...follow_updates);
    } else {
      console.log("failed to log into", refresh_token);
    }
  }

  const custom_updates = check_custom_feed_updates(feeds);
  updates.push(...custom_updates);

  const unique_updates = updates.filter((x, i) => {
    for (let j = i + 1; j < updates.length; j++) {
      if (x.id == updates[j].id)
        return false;
    }
    
    return true;
  });

  for (const [webhook, message] of webhooks)
    post_updates(webhook, unique_updates, message);
}

function post_updates(webhook, updates, message = "")
{
  for (const chapter of updates) {
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
      "content": message,
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
    
    post_webhook(webhook, payload);
  }
}

function refresh_session(refresh_token)
{
  const login_endpoint = API_URL + "/auth/refresh";
  const credentials = { "token": refresh_token };

  const login_request = request(login_endpoint, "POST", credentials);

  if (login_request != null) {
    return login_request.token.session;
  } else {
    return null;
  }
}

function check_follow_feed_updates(access_token)
{
  const previous_check = new Date(Date.now() - TRIGGER_INTERVAL * 60000);
  const str_previous_check = previous_check.toISOString().substring(0, previous_check.toISOString().indexOf('.'));
  
  const feed_parameters = "?translatedLanguage[]=" + LANGUAGE + "&createdAtSince=" + str_previous_check;
  const feed_url = API_URL + "/user/follows/manga/feed" + feed_parameters;

  const feed = request(feed_url, "GET", null, true, access_token);

  if (feed)
    return feed.data;
  else
    return [];
}

function check_custom_feed_updates(feed_ids)
{
  const updates = [];
  for (const feed_id of feed_ids) {
    const previous_check = new Date(Date.now() - TRIGGER_INTERVAL * 60000);
    const str_previous_check = previous_check.toISOString().substring(0, previous_check.toISOString().indexOf('.'));
    
    const feed_parameters = "?translatedLanguage[]=" + LANGUAGE + "&createdAtSince=" + str_previous_check;
    const feed_url = API_URL + "/list/" + feed_id + "/feed" + feed_parameters;
    
    const feed = request(feed_url);

    if (feed)
      updates.push(...feed.data);
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
