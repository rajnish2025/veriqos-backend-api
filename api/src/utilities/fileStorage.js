// import multer from "multer";
// import path from "path";

// const storage = multer.diskStorage({
//   destination: (req, res, cb) => {
//     cb(null, "api/uploads/");
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(
//       null,
//       file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
//     );
//   },
// });

// const upload = multer({
//   storage: storage,
//   limits: { fileSize: 50 * 1024 * 1024 },
//   fileFilter: (req, file, cb) => {
//     const allowedTypes = "jpeg|jpg|png";
//     console.log(file);
//     const exten = path.extname(file.originalname).toLowerCase();
//     console.log("exten", exten, allowedTypes);
//     if (allowedTypes.split("|").includes(exten.substring(1))) {
//       cb(null, true);
//     } else {
//       cb(new Error("Only image of jpeg,jpg,png types allowed to store."));
//     }
//   },
// });

// export default upload;

import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "api/uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = "jpeg|jpg|png";
    const fileExtension = path.extname(file.originalname).toLowerCase();

    console.log("File uploaded:", file);
    console.log("File extension:", fileExtension);
    console.log("Allowed types:", allowedTypes);

    if (allowedTypes.split("|").includes(fileExtension.substring(1))) {
      cb(null, true);
    } else {
      cb(new Error("Only image of jpeg, jpg, png types allowed to store."));
    }
  },
});

export default upload;