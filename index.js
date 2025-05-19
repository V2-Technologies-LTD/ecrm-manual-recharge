import express from "express";
import multer from "multer";
import XLSX from "xlsx";
import axios, { all } from "axios";
import dotenv from "dotenv";
import {
  getOperatorInfo,
  generateAlphanumericCode,
} from "./utils/genericFunction.js";
import { generateExcelFile } from "./utils/fileGenerateFunc.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post("/manual-recharge", upload.single("file"), async (req, res) => {
  const { file } = req;
  if (!file) {
    return res
      .status(400)
      .json({ success: false, message: "No file uploaded" });
  }
  const workbook = XLSX.read(file.buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const results = XLSX.utils.sheet_to_json(worksheet);
  const recharge_amount = process.env.RECHARGE_AMOUNT;
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const headers = {
    "STK-CODE": process.env.STK_CODE,
    "Auth-Key": process.env.SSL_AUTH_KEY,
    "Content-Type": "application/json", // Ensure correct content type
  };
  const URL1 = process.env.BILL_INFO_URL;
  const URL2 = process.env.BILL_PAY_URL;
  let sslTracksInfoList = [];
  for (let i = 0; i < results.length; i++) {
    for (const val of Object.values(results[i])) {
      console.log("Index----> ", i);
      if (typeof val === "number") {
        const generated_transaction_id = generateAlphanumericCode(20);
        const { operator, authKey, secretKey } = getOperatorInfo(val);

        const sslTracksInfo = {
          transaction_id: generated_transaction_id,
          operator,
          recipient_msisdn: `0${val}`,
          type: "mobile_recharge",
          amount: recharge_amount,
          connection_type: "prepaid",
        };

        const bill_info_payload = {
          transaction_id: generated_transaction_id,
          operator_id: operator,
          recipient_msisdn: `0${val}`,
          amount: recharge_amount,
          connection_type: "prepaid",
          utility_auth_key: authKey,
          utility_secret_key: secretKey,
        };
        //step 1
        // trigger bill-info API before payment API call
        const billInfoResponse = await axios.post(URL1, bill_info_payload, {
          headers: headers,
        });

        if (billInfoResponse.data.status_code === "000") {
          const payload2 = {
            transaction_id: generated_transaction_id,
            utility_auth_key: authKey,
            utility_secret_key: secretKey,
          };
          await axios.post(URL2, payload2, {
            headers: headers,
          });
          sslTracksInfo.bill_payment_response = "Success";
        } else {
          sslTracksInfo.bill_payment_response = "FAILED";
        }
        sslTracksInfoList.push(sslTracksInfo);
      }
    }
  }

  const result = generateExcelFile(sslTracksInfoList);
  if (result) {
    return res.status(200).json({
      success: true,
      message: "File generated successfully",
    });
  }
});
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
