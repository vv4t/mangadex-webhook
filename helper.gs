function request(url, method, payload, json = true, access_token = "")
{ 
  const header = {
    "Content-Type": "application/json"
  };

  if (access_token != "")
    header["authorization"] = access_token;
  
  let options = {
    method: method,
    headers: header
  };
  
  if (payload)
    options['payload'] = JSON.stringify(payload);
  
  try {
    const response = UrlFetchApp.fetch(url, options);
    
    let code = response.getResponseCode();
    
    if (code != 200 && code != 204)
      throw { error: code };
    
    console.log(`endpoint: ${url}    http response: ${code}`);
    
    if(code == 204)
      return null;
    
    if (json)
      return JSON.parse(response.getContentText("UTF-8"));
    
    return response.getContentText("UTF-8");
  } catch (error) {
    console.error(error);
  }
  
  return null;
}

function get_array_from_sheets(sheet_name, columns = 0) {
  const ss = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheet_name);
  
  let values;
  try {
    if (columns == 0)
      columns = ss.getLastColumn();
    
    values = ss.getRange(1, 1, ss.getLastRow(), columns).getValues();
  } catch (e) {
    return null;  
  }
  
  return values;
}
