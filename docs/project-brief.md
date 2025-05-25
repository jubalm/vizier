# Project Brief: Vizier Compliance Management System

Vizier is a platform designed to help companies manage and ensure the compliance of their employees with various internal and external requirements. The system maintains a comprehensive database of employee records, including:

- Certificates (e.g., training, licenses)
- Compliance requirements (e.g., background checks, health checks)
- Documents (e.g., signed policies, proof of compliance)

For the purposes of this conceptual project, "Company X" refers to a hypothetical client organization. Company X is not a real company and is used here solely to illustrate the compliance management workflows and requirements. These conceptual client documents are typically stored externally (e.g., in S3 buckets or other document management systems).

Vizier's core business operations include:

- Analyzing employee records to determine compliance status
- Generating reports on compliance for Company X
- Creating and sending requests to employees to fulfill outstanding requirements

As a developer, your task is to build an AI chat agent that assists Vizier's HR agents by:

- Answering questions about employee compliance
- Guiding HR agents through workflows (e.g., checking compliance, requesting documents)
- Leveraging both Vizier's internal database and Company X's policy documents

To develop and test this system, you will need:

- A simulated Vizier database schema with sample employee records
- Example policy and regulatory documents from the conceptual Company X

This setup will allow you to prototype, test, and refine the AI chat agent and associated workflows effectively.
