# Policy-to-Database Mapping

| Policy/Requirement            | Database Requirement Name | Is Mandatory | Related Table(s)                 |
| ----------------------------- | ------------------------- | ------------ | -------------------------------- |
| Background Check Policy       | Background Check          | Yes          | Requirement, EmployeeRequirement |
| Annual Health Check Policy    | Annual Health Check       | Yes          | Requirement, EmployeeRequirement |
| Cybersecurity Training Policy | Cybersecurity Training    | No           | Requirement, EmployeeRequirement |

---

This mapping links conceptual policy documents to the corresponding fields and entities in the Vizier database schema for simulation and workflow automation.
