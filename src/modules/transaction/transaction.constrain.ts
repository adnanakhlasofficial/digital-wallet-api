import { JwtPayload } from "jsonwebtoken";
import { PipelineStage } from "mongoose";

const filter = [
  "sender",
  "senderName",
  "receiver",
  "receiverName",
  "trxId",
  "transactionType",
];

export function getPipeline(
  search: string,
  skip: number,
  limit: number,
  count: boolean = false,
  user?: JwtPayload,
): PipelineStage[] {
  const basePipeline: PipelineStage[] = [
    // Optional user filter
    ...(user
      ? [
          {
            $match: {
              $or: [{ sender: user.phone }, { receiver: user.phone }],
            },
          },
        ]
      : []),

    // Lookup sender details
    {
      $lookup: {
        from: "users",
        localField: "sender",
        foreignField: "phone",
        as: "senderDetails",
      },
    },
    {
      $unwind: { path: "$senderDetails", preserveNullAndEmptyArrays: true },
    },

    // Lookup receiver details
    {
      $lookup: {
        from: "users",
        localField: "receiver",
        foreignField: "phone",
        as: "receiverDetails",
      },
    },
    {
      $unwind: { path: "$receiverDetails", preserveNullAndEmptyArrays: true },
    },
  ];

  if (count) {
    // COUNT MODE → collapse into a single doc
    return [
      ...basePipeline,
      {
        $group: {
          _id: null,
          totalTransaction: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          totalTransaction: 1,
        },
      },
    ];
  }

  // NORMAL MODE → return paginated documents
  return [
    ...basePipeline,

    // Project only needed fields
    {
      $project: {
        _id: 0,
        trxId: 1,
        transactionType: 1,
        sender: 1,
        receiver: 1,
        amount: 1,
        fee: 1,
        commission: 1,
        netAmount: 1,
        createdAt: 1,
        senderName: "$senderDetails.name",
        receiverName: "$receiverDetails.name",
      },
    },

    // Search filter
    ...(search
      ? [
          {
            $match: {
              $or: filter.map((query) => ({
                [query]: { $regex: search, $options: "i" },
              })),
            },
          },
        ]
      : []),

    // Sorting & pagination
    { $sort: { createdAt: -1 } },
    { $skip: skip },
    { $limit: limit },
  ];
}
