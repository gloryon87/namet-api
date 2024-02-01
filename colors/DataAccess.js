import Colors from "./schema.js"

class ColorsDataAccess {
  async getColors() {
    return await Colors.find()
  }
}

export default ColorsDataAccess

