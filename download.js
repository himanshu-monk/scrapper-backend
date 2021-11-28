var mimeTypes = {
  JVBERi0: "data:application/pdf",
  // R0lGODdh: "data:image/gif",
  // R0lGODlh: "data:image/gif",
  // iVBORw0KGgo: "data:image/png",
  UEsDBBQABg: "data:application/vnd.openxmlformats-officedocument.wordprocessingml.document"
}

const createResumeLink = async (buf) => {
  const b64 = await buf.toString('base64');
  let mimeType;
  for (var s in mimeTypes) {
    if (b64.indexOf(s) === 0) {
      mimeType = mimeTypes[s];
      break;
    } else {
      mimeType = "data:application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    }
  }
  return mimeType + ";base64," + b64;
}

module.exports = createResumeLink;