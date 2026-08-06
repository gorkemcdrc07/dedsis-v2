export interface OperationRow {
  Tipi?: string;

  TMSDespatchesId?: number;
  TMSDespatchIncomeExpenseId?: number;

  TMSDespatchesDocumentNo?: string;
  TMSDespatchesDespatchDate?: string;

  SalesInvoceTmsDespatches?: string;
  ErpSalesInvoceCreateDate?: string;
  ErpSalesInvoceCreateBy?: string;

  SupplierName?: string;
  CurrentAccountsName?: string;

  ServiceExpense?: string;
  ServiceExpenseName?: string;
  SubServiceName?: string;

  PlateNumber?: string;
  ProjectName?: string;

  GivenVehicleTypeName?: string;
  DesiredVehicleTypeName?: string;

  VehicleWorkingTypeId?: number;
  VehicleWorkingTypeName?: string;
  VehicleMasterGroupName?: string;
  SpecialGroupName?: string;

  Quantity?: number;
  UnitName?: string;
  TotalTonnage?: number;

  CustomerOrderNumber?: string;
  CustomerDocumentNumber?: string;

  ServiceIncome?: number;
  CostIncome?: number;

  InvoiceSaleDate?: string;
  SalesInvoceIncome?: number;
  SalesInvoceNo?: string;
  SalesOrderDate?: string;
  SalesOrderIncome?: number;

  ServiceExpenses?: number;
  CostExpenses?: number;

  PurchaseInvoiceDate?: string;
  PurchaseInvoiceIncome?: number;
  PurchaseInvoicNo?: string;
  PurchaseOrderDate?: string;
  PurchaseOrderRevenue?: number;

  CreatedByName?: string;
  CreatedDate?: string;

  LastModifiedByName?: string;
  LastModifiedDate?: string | null;

  Description?: string;
  VatRate?: number;

  [key: string]: unknown;
}

export interface OperationsResponse {
  items: OperationRow[];
  totalCount: number;
  page: number;
  pageSize: number;
}
