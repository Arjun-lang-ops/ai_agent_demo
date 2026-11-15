const evaluationDataset = [
  {
    id: "test_1",

    query: "What is the refund policy?",

    expectedDocumentIds: [
      "DOCUMENT_ID_1"
    ],

    expectedAnswer:
      "Customers can request a refund within 30 days."
  },

  {
    id: "test_2",

    query: "What are the payment methods?",

    expectedDocumentIds: [
      "DOCUMENT_ID_2"
    ],

    expectedAnswer:
      "Customers can pay using cards and online payment methods."
  },

  {
    id: "test_3",

    query: "What is the delivery policy?",

    expectedDocumentIds: [
      "DOCUMENT_ID_3"
    ],

    expectedAnswer:
      "Orders are delivered within the specified delivery period."
  }
];

export default evaluationDataset;