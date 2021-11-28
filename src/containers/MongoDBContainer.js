import mongoose from 'mongoose';

class MongoDBContainer {
  constructor(model, schema) {
    this.model = mongoose.model(model, schema);
    console.log("entra mongo");
  }

  async save(entry) {
    console.log("entry", entry);
    try {
      const newDocument = new this.model(entry);
      const result = await newDocument.save();
      return result._id;
    } catch (error) {
      console.log("ERROR:", error);
    }
  }

  async update(id, entry) {
    try {
      await this.model.updateOne({_id: id}, {$set: {...entry}});  
      return {...entry, _id: id};
    } catch (error) {
      console.log("ERROR:", error);
    }
  }

  async getById(id) {
    try {
      return await this.model.findOne({_id: id}).lean();
    } catch (error) {
      console.log("ERROR:", error);
    }
  }

  async getAll() {
    try {
      return await this.model.find().lean();
    } catch (error) {
      return [];
    }
  }

  async deleteById(id) {
    try {
      await this.model.deleteOne({_id: id});
    } catch (error) {
      console.log("ERROR:", error);
    }
  }
}

export default MongoDBContainer;
