import { Company } from "../models/company.model.js";
export const registerCompany = async (req, res) => {
    try{
        const { companyName, description } = req.body;
        if(!companyName) { // check if companyName is provided in the request body{
            return res.status(404).json({
                error: "Company name is required",
                success: false,
            });
        }
        if(!description) { // check if description is provided in the request body
            return res.status(404).json({
                error: "Description is required",
                success: false,
            });
        }
        let company = await Company.findOne({ name: companyName });
        if(company) { // check if company already exists
            return res.status(404).json({
                error: "Company already exists",
                success: false,
            });
        }
        company = await Company.create({
            name: companyName,
            description,
            userId: req.id
        });
        return res.status(201).json({
            message: "Company registered successfully",
            company: company,
            success: true,
        });
    } catch(error) {
        return res.status(500).json({
            error: "Error registering company:",
            success: false,
        });
    }
};

export const getAllCompanies = async (req, res) => {
    try{
        const userId = req.id; //to find only those companies created by the user
        const companies = await Company.find({ userId });
        if(!companies) {
            return res.status(404).json({
                error: "No companies found",
                success: false,
            });
        }
        return res.status(200).json({
            companies: companies,
            success: true,
        });
    } catch(error) {
        return res.status(500).json({
            error: "Error retrieving companies:",
            success: false,
        });
    }
};


export const getCompanyById = async (req, res) => {
    try{
        const companyId = req.params.id;
        const company = await Company.findById(companyId);
        if(!company) {
            return res.status(404).json({
                error: "Company not found",
                success: false,
            });
        }
        return res.status(200).json({
            company: company,
            success: true,
        });

    } catch(Error) {
        return res.status(500).json({
            error: "Error retrieving company:",
            success: false,
        });
    }
};


export const updateCompany = async (req, res) => {
    try{
        const { name, description, website, location } = req.body;
        const file = req.file;
        // cloudinary upload

        const updateData = { name, description, website, location };

        const company = await Company.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if(!company) {
            return res.status(404).json({
                error: "Company not found",
                success: false,
            });
        }
        return res.status(200).json({
            company: company,
            success: true,
        });
    } catch(error) {
        return res.status(500).json({
            error: "Error updating company:",
            success: false,
        });
    }
}