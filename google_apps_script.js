/**
 * Google Apps Script for BloodHelp Hospital & Blood Bank Sync
 * 
 * Instructions:
 * 1. Open your Google Spreadsheet: https://docs.google.com/spreadsheets/d/16hqg2hqNV0dqeAFQif91SQa4PTDM6B3xHrARqTNO8EU/edit
 * 2. Click "Extensions" -> "Apps Script" in the top menu.
 * 3. Delete any code in the editor and paste this entire code.
 * 4. Click "Deploy" (top right) -> "New deployment".
 * 5. Click the gear icon next to "Select type" -> select "Web app".
 * 6. Set Description: "BloodHelp Sync".
 * 7. Set "Execute as": "Me".
 * 8. Set "Who has access": "Anyone" (crucial for mobile app webhook).
 * 9. Click "Deploy" and authorize permissions.
 * 10. Copy the "Web app URL" and add it to your .env file as:
 *     EXPO_PUBLIC_GOOGLE_SHEET_WEBHOOK_URL=https://script.google.com/macros/s/.../exec
 */

const HEADERS = [
  "ID",
  "Name",
  "Type",
  "Phone",
  "Address",
  "City",
  "State",
  "Verified",
  "24 Hours",
  "Operating Hours",
  "A+",
  "A-",
  "B+",
  "B-",
  "O+",
  "O-",
  "AB+",
  "AB-",
  "Last Updated"
];

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    ensureHeaders(sheet);

    const body = JSON.parse(e.postData.contents);
    const action = body.action || "upsertHospital";

    if (action === "upsertHospital") {
      upsertRow(sheet, body.data);
    } else if (action === "bulkUpsert") {
      (body.data || []).forEach(row => upsertRow(sheet, row));
    }

    return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService.createTextOutput(JSON.stringify({ status: "ok", app: "BloodHelp Google Sheets Sync" }))
    .setMimeType(ContentService.MimeType.JSON);
}

function ensureHeaders(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    // Format header row: bold, blue background, white text
    const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
    headerRange.setFontWeight("bold");
    headerRange.setBackground("#DC2626");
    headerRange.setFontColor("#FFFFFF");
  }
}

function upsertRow(sheet, data) {
  const values = [
    data.id || "",
    data.name || "",
    data.type || "",
    data.phone || "",
    data.address || "",
    data.city || "",
    data.state || "",
    data.isVerified ? "Yes" : "No",
    data.isOpen24Hours ? "Yes" : "No",
    data.operatingHours || "",
    data.inventory_A_pos ?? 0,
    data.inventory_A_neg ?? 0,
    data.inventory_B_pos ?? 0,
    data.inventory_B_neg ?? 0,
    data.inventory_O_pos ?? 0,
    data.inventory_O_neg ?? 0,
    data.inventory_AB_pos ?? 0,
    data.inventory_AB_neg ?? 0,
    data.lastUpdated || new Date().toISOString()
  ];

  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    const idColumnValues = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    for (let i = 0; i < idColumnValues.length; i++) {
      if (idColumnValues[i][0] === data.id) {
        // Update existing row
        sheet.getRange(i + 2, 1, 1, values.length).setValues([values]);
        return;
      }
    }
  }

  // If not found, append new row
  sheet.appendRow(values);
}
