const asyncHandler=require("express-async-handler");
const EducationalResource = require("../models/resourcesModel");

const resourcesController={
    getResources:asyncHandler(async (req, res) => {
          const resources = await EducationalResource.find();
          if(!resources){
            res.send('No resources found')
          }
          res.send(resources);
      }),
      
    getResourceById : asyncHandler(async (req, res) => {
        const {title}=req.body
        const searchCriteria = {};
        searchCriteria.title = { $regex: title, $options: "i" };
          const resource = await EducationalResource.find(searchCriteria);
          if (!resource) throw new Error("Resource not found");
          res.send(resource);
      }),
      
      createResource :asyncHandler(async (req, res) => {
        const { title, resourceType, content, description } = req.body;
        const existingResource = await EducationalResource.findOne({ title, resourceType });      
        if (existingResource) {
          throw new Error("A resource with the same title and resourceType already exists.");
        }      
        const newResource = new EducationalResource({ title, resourceType, content:req.file?.path || req.file?.url || "", description });      
        const complete = await newResource.save();
        if (!complete) {
          throw new Error("Error in creating resource");
        }      
        res.send(newResource);
      }),
      
    updateResource :asyncHandler(async (req, res) => {
        const { id,title, content, description } = req.body;
          const updatedResource = await EducationalResource.findOne({_id:id});
          updatedResource.title = title || updatedResource.title;
          updatedResource.content = resourceType || updatedResource.content;
          updatedResource.description = description || updatedResource.description;
          await updatedResource.save()
          res.send(updatedResource);
      }),
      
    deleteResource :asyncHandler(async (req, res) => {
        const { id} = req.params;
          const deletedResource = await EducationalResource.findByIdAndDelete(id);
          if (!deletedResource) throw new Error("Resource not found or Deletion failed" );
          res.send("Resource deleted successfully");
    })
}
module.exports=resourcesController