const { cloudinary } = require("../config");
const { sendSuccess, sendError, asyncHandler } = require("../utils");

const uploadBufferToCloudinary = (file) => new Promise((resolve, reject) => {
  const uploadStream = cloudinary.uploader.upload_stream(
    {
      folder: "chat-app",
      resource_type: "auto",
      use_filename: true,
      unique_filename: true
    },
    (error, result) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(result);
    }
  );

  uploadStream.end(file.buffer);
});

const uploadFile = asyncHandler(async (req, res) => {
  const missingConfig = cloudinary.getMissingConfig();

  if (missingConfig.length) {
    console.error("Cloudinary configuration is missing:", missingConfig);
    return sendError(res, 500, "Cloudinary configuration missing", missingConfig);
  }

  const file = req.file;

  if (!file) {
    console.error("uploadFile called without a file");
    return sendError(res, 400, "File required");
  }

  const result = await uploadBufferToCloudinary(file);

  return sendSuccess(res, 200, "File uploaded successfully", {
    fileUrl: result.secure_url,
    publicId: result.public_id,
    resourceType: result.resource_type
  });
});

module.exports = {
  uploadFile
};
