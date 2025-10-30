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

    // Project only needed fields (so you can search by projected names)
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
  ];

  // Add search filter if provided (both for count and normal mode)
  const searchFilter: PipelineStage[] = search
    ? [
        {
          $match: {
            $or: filter.map((field) => ({
              [field]: { $regex: search, $options: "i" },
            })),
          },
        },
      ]
    : [];

  // COUNT MODE → only return total count after search
  if (count) {
    return [
      ...basePipeline,
      ...searchFilter,
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

  // NORMAL MODE → paginated transactions
  return [
    ...basePipeline,
    ...searchFilter,
    { $sort: { createdAt: -1 } },
    { $skip: skip },
    { $limit: limit },
  ];
}
