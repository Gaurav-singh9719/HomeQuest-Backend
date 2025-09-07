## 1️⃣ User Model (src/models/User.js)
```javascript
{
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["owner", "tenant"], required: true }
}
```
## Purpose:
This model is used for authentication and role management.

    owner → can add or delete properties.

    tenant → can send rental requests for properties.
## 2️⃣ Property Model (src/models/Property.js)
```javascript
{
  title: { type: String, required: true },
  description: String,
  address: { type: String, required: true },
  price: { type: Number, required: true },
  images: [String],   
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  requests: [{ type: mongoose.Schema.Types.ObjectId, ref: "Request" }]
}
```
## Purpose:
Represents a property listed by an owner.

    images → contains Cloudinary URLs or local file paths.

    owner → references the user who created the property.

    requests → stores all rental requests related to this property.

## 3️⃣ Request Model (src/models/Request.js)

```javascript
{
  tenant: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  property: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" }
}
```
## Purpose:
Tracks rental requests made by tenants.

    tenant → references the tenant who applied.

    property → references the property the request is for.

    status → allows the owner to approve or reject the request.

## 🔗 Relationships Between Models

    User → Property → One-to-Many
    (One owner can post multiple properties)

    Property → Request → One-to-Many
    (A single property can have multiple rental requests from tenants)

    User → Request → One-to-Many
    (A tenant can apply for multiple properties)
