export const activeVsInactiveData = {
  labels: [
    "𝘈. 𝘣𝘢𝘶𝘮𝘢𝘯𝘯𝘪𝘪 ATCC 19606",
    "𝘌. 𝘤𝘰𝘭𝘪 ATCC 11775",
    "𝘌. 𝘤𝘰𝘭𝘪 AIC221",
    "𝘌. 𝘤𝘰𝘭𝘪 AIC222 - CRE",
    "𝘒. 𝘱𝘯𝘦𝘶𝘮𝘰𝘯𝘪𝘢𝘦 ATCC 13883",
    "𝘗. 𝘢𝘦𝘳𝘶𝘨𝘪𝘯𝘰𝘴𝘢 PA01",
    "𝘗. 𝘢𝘦𝘳𝘶𝘨𝘪𝘯𝘰𝘴𝘢 PA14",
    "𝘚. 𝘢𝘶𝘳𝘦𝘶𝘴 ATCC 12600",
    "𝘚. 𝘢𝘶𝘳𝘦𝘶𝘴 ATCC BAA-1556 - MRSA",
    "𝘌. 𝘧𝘢𝘦𝘤𝘢𝘭𝘪𝘴 ATCC 700802 - VRE",
    "𝘌. 𝘧𝘢𝘦𝘤𝘪𝘶𝘮 ATCC 700221 - VRE"
  ],
  datasets: [
    {
      label: 'Active',
      data: [620, 419, 568, 533, 422, 409, 404, 357, 209, 67, 295],
      backgroundColor: '#344BAF',
    },
    {
      label: 'Inactive',
      data: [938, 1098, 990, 1025, 1219, 1149, 1102, 1253, 1247, 811, 583],
      backgroundColor: '#C60000',
    }
  ]
};

export const micDistributionData = {
  labels: ['128', '64', '50', '32', '25', '20', '16', '12.5', '8', '6.25', '4', '3.12', '2', '1.56', '1', '0.78'],
  datasets: [{
    data: [1096, 518, 169, 465, 134, 1, 464, 115, 474, 70, 364, 63, 185, 51, 94, 37],
    backgroundColor: [
      '#003F88', // Darkest blue
      '#0052B0', // Dark blue
      '#0065D1', // Blue
      '#2176E7', // Medium blue
      '#65A3F4', // Light blue
      '#FFE5AA', // Light yellow
      '#FFD666', // Yellow
      '#FFC123', // Dark yellow
      '#FFA500', // Orange
      '#FF8C00', // Dark orange
      '#FF6B00', // Darker orange
      '#FF4D00', // Reddish orange
      '#FF2D00', // Orange red
      '#FF1100', // Red
      '#CC0000', // Dark red
      '#990000'  // Darkest red
    ],
  }]
};

// Sample violin plot data - formatted for violin plots
export const netChargeData = {
  labels: ['Net Charge'],
  datasets: [{
    data: [-4, -4, -3, -3, -2, -2, -1, -1, -1, -1, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 5, 5, 6, 7, 8, 9, 10, 11, 13, 14],
    backgroundColor: 'rgba(79, 70, 229, 0.2)',
    borderColor: 'rgb(79, 70, 229)',
    borderWidth: 1,
  }]
};

export const aminoAcidFrequencyData = {
  labels: ['A', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'V', 'W', 'Y'],
  datasets: [{
    data: [0.0605, 0.0150, 0.0214, 0.0237, 0.0537, 0.0558, 0.0211, 0.0700, 0.1184, 0.1325, 0.0231, 0.0262, 0.0472, 0.0280, 0.0952, 0.0582, 0.0367, 0.0564, 0.0301, 0.0267],
    backgroundColor: '#344BAF',
  }]
};

export const aminoAcidCompositionData = {
  labels: ['A', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'V', 'W', 'Y'],
  datasets: [{
    data: [1887, 469, 667, 740, 1674, 1741, 658, 2182, 3690, 4131, 720, 816, 1472, 874, 2969, 1814, 1144, 1757, 937, 833],
    backgroundColor: '#C60000',
  }]
};

export const lengthDistributionData = {
  labels: Array.from({length: 49}, (_, i) => (i + 2).toString()),
  datasets: [{
    data: [0.00122, 0.00061, 0.00122, 0.00548, 0.00183, 0.00914, 0.04507, 0.05359, 0.05420, 0.03532, 0.04019, 0.08343, 0.07430, 0.04263, 0.05238, 0.02436, 0.04141, 0.04446, 0.04994, 0.01766, 0.02984, 0.02010, 0.02558, 0.02741, 0.04141, 0.01340, 0.01279, 0.01583, 0.01523, 0.00548, 0.01157, 0.01279, 0.00792, 0.00609, 0.00853, 0.01096, 0.01340, 0.01096, 0.00609, 0.00426, 0.00244, 0.00244, 0.00426, 0.00183, 0.00183, 0.00244, 0.00487, 0.00061, 0.00122],
    backgroundColor: '#344BAF',
  }]
}; 