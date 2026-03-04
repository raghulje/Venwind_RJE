const express = require("express");
const CompanyController = require("../controllers/company");
const authMiddleware = require("../middlewares/auth");
const Type = require("../utils/userTypes");
const uploadLogo = require("../middlewares/uploadLogo");
const router = express.Router();
const validation = require("../middlewares/companyValidator");

router
  .route("/company_list")
  .get(authMiddleware.authCheck, CompanyController.listCompanies);

router
  .route("/companies")
  .get(authMiddleware.authCheck, CompanyController.getAllCompanies)
  .post(
    authMiddleware.authCheck,
    uploadLogo,
    validation.createCompanyData,
    
    CompanyController.createCompany
  );

// router
// .route("/company/:id")
// .get(CompanyController.getCompanyById)
// .put(validation.updateCompanyData,CompanyController.updateCompanyById)
// .delete(CompanyController.deleteCompanyById);

router
  .route("/companies/:company_id")
  .get(authMiddleware.authCheck, CompanyController.getCompanyByCompanyId)
  .put(
    authMiddleware.authCheck,
       uploadLogo,
    // validation.updateCompanyData,
    CompanyController.updateCompanyByCompanyId
  );
// .delete(
//   authMiddleware.authCheck,
//   // authMiddleware.authAllowTypes([Type.Admin, Type.SuperAdmin]),
//   CompanyController.deleteCompanyByCompanyId
// );

router
  .route("/delete_companies")
  .post(authMiddleware.authCheck, CompanyController.deleteCompanyByCompanyId);

module.exports = router;
