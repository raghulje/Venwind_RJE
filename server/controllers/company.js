const { Company, Branch } = require("../models");
const qs = require("querystring");
const { Op } = require("sequelize");
const Response = require("../helpers/response");
const { validationResult } = require("express-validator");
const { APP_URL, LIMIT_DATA } = process.env;

const CompanyController = {
  createCompany: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return Response.responseStatus(res, 400, "Validation Failed", errors);
      }

      const { id } = req.userData || { user_id: null };
      const { companyName, companyWebSite, defaultTemplate } = req.body;

      // Prepare the data for creation
      const companyData = {
        company_name: companyName,
        company_website: companyWebSite,
        company_logo: req.file ? req.file.filename : "",
        default_template: defaultTemplate,
        created_by: id,
        modified_by: id,
        // branches: companyBranches?.map((branch) => ({
        //   branch_name: branch.companyBranchName,
        //   branch_address: branch.companyBranchAddress,
        //   google_map_link: branch.googleMapLink,
        //   created_by: id,
        //   modified_by: id,
        // })),
      };

      // Create company and its branches in one step
      const company = await Company.create(companyData);

      return Response.responseStatus(
        res,
        201,
        "Company created successfully",
        company
      );
    } catch (error) {
      return Response.responseStatus(res, 500, "Internal server error", {
        error: error.message,
      });
    }
  },

  listCompanies: async (req, res) => {
    try {
      const {
        field = "company_name", // Default sort field
        search = "",
        page = 1,
        limit = LIMIT_DATA,
        sort = "company_name",
        order = "ASC",
      } = req.query;
      //  console.log("limit",limit)

      const offset = (Number(page) - 1) * Number(limit);

      // Setup where condition for search
      const where = search
        ? {
            [field]: {
              [require("sequelize").Op.like]: `%${search}%`,
            },
          }
        : {};

      // Count total records matching search
      const totalData = await Company.count({ where });

      // Fetch paginated data
      const results = await Company.findAll({
        where,
        offset,
        limit: Number(limit),
        order: [[sort, order]],
      });

      const formattedCompanies = results.map((row) => ({
        ...row.get(),
        company_logo: row.company_logo
          ? `${APP_URL}/uploads/logos/${row.company_logo}`
          : null,
      }));

      const totalPage = Math.ceil(totalData / limit);

      const nextQuery = qs.stringify({ ...req.query, page: Number(page) + 1 });
      const prevQuery = qs.stringify({ ...req.query, page: Number(page) - 1 });

      const pageInfo = {
        totalData,
        totalPage,
        currentPage: Number(page),
        nextLink:
          Number(page) < totalPage
            ? `${APP_URL}/api/companies?${nextQuery}`
            : null,
        prevLink:
          Number(page) > 1 ? `${APP_URL}/api/companies?${prevQuery}` : null,
      };

      if (results.length > 0) {
        return Response.responseStatus(
          res,
          200,
          "List of all Companies",
          formattedCompanies,
          pageInfo
        );
      }

      return Response.responseStatus(res, 400, "No data found");
    } catch (error) {
      return Response.responseStatus(res, 500, "Internal server error", {
        error: error.message,
      });
    }
  },
  getAllCompanies: async (req, res) => {
    try {
      const companies = await Company.findAll({
        // include: [
        //   {
        //     model: Branch,
        //     as: "branches", // adjust alias to match your association
        //   },
        // ],
      });

      if (companies.length === 0) {
        return Response.responseStatus(res, 400, "No data found");
      }

      const formattedCompanies = companies.map((company) => ({
        ...company.get(),
        company_logo: company.company_logo
          ? `${APP_URL}/uploads/logos/${company.company_logo}`
          : null,
      }));

      return Response.responseStatus(
        res,
        200,
        "List of companies with branches",
        formattedCompanies
      );
    } catch (error) {
      return Response.responseStatus(res, 500, "Internal server error", {
        error: error.message,
      });
    }
  },

  // getCompanyById: async (req, res) => {
  //   const id = req.params.id;
  //   try {
  //     const companyData = await Company.getCompanyByCondition({ id });
  //     if (companyData.length > 0) {
  //       return Response.responseStatus(
  //         res,
  //         200,
  //         `Details of Company(${id})`,
  //         companyData
  //       );
  //     }
  //     return Response.responseStatus(res, 400, `No data found for ${id}`);
  //   } catch (error) {
  //     return Response.responseStatus(res, 500, "Internal server error", {
  //       error: error.message,
  //     });
  //   }
  // },

  getCompanyByCompanyId: async (req, res) => {
    const { company_id } = req.params;

    try {
      // Get the company and include its branches
      const company = await Company.findOne({
        where: { id: company_id },
      });

      if (!company) {
        return Response.responseStatus(
          res,
          400,
          `No data found for ${company_id}`
        );
      }

      // Convert Sequelize instance to plain object and decode logo
      const companyData = {
        ...company.get(),
        company_logo: company.company_logo
          ? `${APP_URL}/uploads/logos/${company.company_logo}`
          : null,
      };

      return Response.responseStatus(
        res,
        200,
        `Details of Company (${company_id})`,
        companyData
      );
    } catch (error) {
      return Response.responseStatus(res, 500, "Internal server error", {
        error: error.message,
      });
    }
  },

  // updateCompanyById: async (req, res) => {
  //   try {
  //     const errors = validationResult(req);
  //     if (!errors.isEmpty()) {
  //       return Response.responseStatus(res, 400, "Validation Failed", errors);
  //     }
  //     const id = req.params.id;
  //     const { companyName, companyWebSite, companyLogo, modifiedBy } = req.body;
  //     const companyData = {
  //       company_name: companyName,
  //       company_website: companyWebSite,
  //       company_logo: companyLogo,
  //       modified_by: modifiedBy,
  //     };
  //     const result = await Company.updateCompanyByCondition(
  //       { id },
  //       companyData
  //     );
  //     if (result.affectedRows > 0) {
  //       return Response.responseStatus(
  //         res,
  //         200,
  //         "Company Data updated successfully"
  //       );
  //     }
  //     return Response.responseStatus(
  //       res,
  //       400,
  //       `Failed to update Employee Data`
  //     );
  //   } catch (error) {
  //     return Response.responseStatus(res, 500, "Internal server error", {
  //       error: error.message,
  //     });
  //   }
  // },

  updateCompanyByCompanyId: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return Response.responseStatus(res, 400, "Validation Failed", errors);
      }
      const modifiedBy = req?.userData?.id;

      const { company_id } = req.params;
      const {
        companyName,
        companyWebSite,
        defaultTemplate,
        companyLogo,
        companyBranches = [],
      } = req.body;

      // Find company
      const company = await Company.findOne({ where: { id: company_id } });
      if (!company) {
        return Response.responseStatus(res, 404, "Company not found");
      }

      // Update company
      await company.update({
        company_name: companyName,
        company_website: companyWebSite,
        company_logo: req.file ? req.file.filename : company.company_logo,
        default_template: defaultTemplate,
        modified_by: modifiedBy,
      });

      // Get current branches from DB
      // const prevBranches = await Branch.findAll({
      //   where: { company_id },
      // });

      // const prevBranchMap = new Map(prevBranches.map((b) => [b.id, b]));

      // const incomingBranchIds = new Set();

      // // Process incoming branches
      // for (const branch of companyBranches) {
      //   if (branch.id && prevBranchMap.has(branch.id)) {
      //     // Update existing branch
      //     await Branch.update(
      //       {
      //         branch_name: branch.companyBranchName,
      //         branch_address: branch.companyBranchAddress,
      //         google_map_link: branch.googleMapLink,
      //         modified_by: modifiedBy,
      //       },
      //       {
      //         where: {
      //           id: branch.id,
      //           company_id,
      //         },
      //       }
      //     );
      //     incomingBranchIds.add(branch.branchId);
      //   } else {
      //     // Create new branch
      //     await Branch.create({
      //       company_id,
      //       branch_name: branch.companyBranchName,
      //       branch_address: branch.companyBranchAddress,
      //       google_map_link: branch.googleMapLink,
      //       created_by: modifiedBy,
      //       modified_by: modifiedBy,
      //     });
      //   }
      // }

      // // Delete branches that are no longer in the incoming list
      // const branchesToDelete = prevBranches.filter(
      //   (branch) => !incomingBranchIds.has(branch.branch_id)
      // );

      // for (const branch of branchesToDelete) {
      //   await branch.destroy(); // soft delete if `paranoid: true`
      // }

      return Response.responseStatus(res, 200, "Company updated successfully");
    } catch (error) {
      return Response.responseStatus(res, 500, "Internal server error", {
        error: error.message,
      });
    }
  },

  // deleteCompanyById: async (req, res) => {
  //   try {
  //     const id = req.params.id;
  //     const result = await Company.deleteCompanyByCondition({ id });
  //     if (result.affectedRows > 0) {
  //       return Response.responseStatus(
  //         res,
  //         200,
  //         `Company Data deleted successfully`
  //       );
  //     }
  //     return Response.responseStatus(
  //       res,
  //       404,
  //       `Failed to delete Employee Data`
  //     );
  //   } catch (error) {
  //     return Response.responseStatus(res, 500, "Internal server error", {
  //       error: error.message,
  //     });
  //   }
  // },
  deleteCompanyByCompanyId: async (req, res) => {
    try {
      const { company_ids = [] } = req.body;
      //  console.log("company_ids",company_ids)
      const deletedBy = req?.userData?.id;

      if (!Array.isArray(company_ids) || company_ids.length === 0) {
        return Response.responseStatus(res, 400, "No company IDs provided");
      }

      for (const company_id of company_ids) {
        // Check if company exists
        const company = await Company.findOne({ where: { id: company_id } });
        if (!company) {
          return Response.responseStatus(
            res,
            404,
            `Company ID ${company_id} not found`
          );
        }

        // Soft delete all branches for this company
        // await Branch.destroy({
        //   where: { company_id },
        // });.

        // Soft delete the company
        await Company.update(
          { deleted_by: deletedBy },
          { where: { id: company_id } }
        );
        const deleted = await Company.destroy({
          where: { id: company_id },
        });

        if (!deleted) {
          return Response.responseStatus(
            res,
            404,
            `Failed to delete Company ID ${company_id}`
          );
        }
      }

      return Response.responseStatus(res, 200, "Company deleted successfully");
    } catch (error) {
      return Response.responseStatus(res, 500, "Internal server error", {
        error: error.message,
      });
    }
  },
};

module.exports = CompanyController;

// updateCompanyByCompanyId: async (req, res) => {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return Response.responseStatus(res, 400, "Validation Failed", errors);
//     }
//     const company_id = req.params.company_id;
//     const { companyName, companyWebSite, companyLogo, Branch=[], modifiedBy } = req.body;

//     const companyData = {
//       company_name: companyName,
//       company_website: companyWebSite,
//       company_logo: companyLogo,
//       modified_by: modifiedBy,
//     };

//     const result = await Company.updateCompanyByCondition(
//       { company_id },
//       companyData
//     );

//     if (result.affectedRows > 0) {

//         const deleteResult = await BranchModel.deleteBranchByCondition({company_id});
//         if(deleteResult.affectedRows>0){

//           Branch.map(async (branches)=>{
//             const branchData={
//              branch_name: branches.companyBranchName,
//              branch_address: branches.companyBranchAddress,
//              google_map_link: branches.googleMapLink,
//              company_id: company_id,
//              created_by: modifiedBy,
//              modified_by: modifiedBy
//             };

//             await BranchModel.createBranch(branchData);

//            });
//         }

//       return Response.responseStatus(
//         res,
//         200,
//         "Company updated successfully"
//       );
//     }
//     return Response.responseStatus(res, 400, `Failed to update Company`);
//   } catch (error) {
//     return Response.responseStatus(res, 500, "Internal server error", {
//       error: error.message,
//     });
//   }
// },
