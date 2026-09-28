import type { SizeRow } from '@/components/ProductDetailModal';

export interface SizeChartData {
  labels: string[];
  rows: SizeRow[];
  title: { en: string; zh: string };
}

// Women's sweaters size chart
export const womensSizeChart: SizeChartData = {
  labels: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  title: { en: 'Size Chart (cm)', zh: '尺码表（厘米）' },
  rows: [
    { label: { en: 'Bust', zh: '胸围' }, values: ['82', '86', '90', '96', '102', '108'] },
    { label: { en: 'Shoulder', zh: '肩宽' }, values: ['36', '37', '38', '39', '40', '41'] },
    { label: { en: 'Sleeve Length', zh: '袖长' }, values: ['56', '57', '58', '59', '60', '61'] },
    { label: { en: 'Total Length', zh: '衣长' }, values: ['58', '60', '62', '64', '66', '68'] },
    { label: { en: 'Hem Width', zh: '下摆围' }, values: ['78', '82', '86', '92', '98', '104'] },
  ],
};

// Kids' sweaters size chart (by age)
export const kidsSizeChart: SizeChartData = {
  labels: ['2T', '3T', '4T', '5-6Y', '7-8Y', '9-10Y', '11-12Y'],
  title: { en: 'Size Chart (cm)', zh: '尺码表（厘米）' },
  rows: [
    { label: { en: 'Bust (1/2)', zh: '半胸围' }, values: ['28', '30', '32', '34', '36', '38', '40'] },
    { label: { en: 'Shoulder', zh: '肩宽' }, values: ['24', '25', '26', '28', '30', '32', '34'] },
    { label: { en: 'Sleeve Length', zh: '袖长' }, values: ['32', '35', '38', '42', '46', '50', '54'] },
    { label: { en: 'Total Length', zh: '衣长' }, values: ['38', '41', '44', '48', '52', '56', '60'] },
    { label: { en: 'Recommended Height', zh: '建议身高' }, values: ['90', '100', '110', '120', '130', '140', '150'] },
  ],
};

// Men's sweaters size chart
export const mensSizeChart: SizeChartData = {
  labels: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
  title: { en: 'Size Chart (cm)', zh: '尺码表（厘米）' },
  rows: [
    { label: { en: 'Chest', zh: '胸围' }, values: ['96', '100', '104', '110', '116', '122'] },
    { label: { en: 'Shoulder', zh: '肩宽' }, values: ['42', '43', '44', '45', '46', '47'] },
    { label: { en: 'Sleeve Length', zh: '袖长' }, values: ['58', '59', '60', '61', '62', '63'] },
    { label: { en: 'Total Length', zh: '衣长' }, values: ['64', '66', '68', '70', '72', '74'] },
    { label: { en: 'Hem Width', zh: '下摆围' }, values: ['92', '96', '100', '106', '112', '118'] },
  ],
};

// Loungewear size chart
export const loungewearSizeChart: SizeChartData = {
  labels: ['S', 'M', 'L', 'XL', 'XXL'],
  title: { en: 'Size Chart (cm)', zh: '尺码表（厘米）' },
  rows: [
    { label: { en: 'Top Bust', zh: '上衣胸围' }, values: ['86', '92', '98', '104', '110'] },
    { label: { en: 'Top Length', zh: '上衣衣长' }, values: ['60', '62', '64', '66', '68'] },
    { label: { en: 'Top Sleeve', zh: '上衣袖长' }, values: ['56', '57', '58', '59', '60'] },
    { label: { en: 'Pants Waist', zh: '裤子腰围' }, values: ['64', '68', '72', '76', '80'] },
    { label: { en: 'Pants Length', zh: '裤子裤长' }, values: ['94', '96', '98', '100', '102'] },
  ],
};

// Pet dog sweaters size chart
export const petSizeChart: SizeChartData = {
  labels: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  title: { en: 'Size Chart (cm)', zh: '尺码表（厘米）' },
  rows: [
    { label: { en: 'Back Length', zh: '背长' }, values: ['20', '25', '30', '35', '40', '45'] },
    { label: { en: 'Chest Girth', zh: '胸围' }, values: ['30', '36', '42', '48', '54', '60'] },
    { label: { en: 'Neck Girth', zh: '颈围' }, values: ['20', '24', '28', '32', '36', '40'] },
    { label: { en: 'Recommended Weight', zh: '建议体重' }, values: ['<2kg', '2-4kg', '4-6kg', '6-9kg', '9-12kg', '12-18kg'] },
  ],
};

// Knit accessories size chart
export const accessoriesSizeChart: SizeChartData = {
  labels: ['One Size'],
  title: { en: 'Specifications (cm)', zh: '规格参数（厘米）' },
  rows: [
    { label: { en: 'Hat Circumference', zh: '帽围' }, values: ['52-58 (弹性/Stretch)'] },
    { label: { en: 'Scarf Length', zh: '围巾长度' }, values: ['180-200'] },
    { label: { en: 'Scarf Width', zh: '围巾宽度' }, values: ['25-30'] },
    { label: { en: 'Gloves Length', zh: '手套长度' }, values: ['22-24'] },
  ],
};

export const sizeCharts: Record<string, SizeChartData> = {
  womens: womensSizeChart,
  kids: kidsSizeChart,
  mens: mensSizeChart,
  loungewear: loungewearSizeChart,
  pet: petSizeChart,
  accessories: accessoriesSizeChart,
};
