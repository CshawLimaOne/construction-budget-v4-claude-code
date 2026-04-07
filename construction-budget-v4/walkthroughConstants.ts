
import { WalkthroughRoomDef } from './types';

export const WALKTHROUGH_TEMPLATE: WalkthroughRoomDef[] = [
  {
    id: 'kitchen',
    label: 'Kitchen',
    icon: 'kitchen',
    items: [
      { id: 'cabinets', label: 'Cabinets', targetCategory: 'Finishes', targetItemName: 'Cabinets (Kitchen & Bath)', defaultCostCode: 'Kitchen_Cabinets' },
      { id: 'countertops', label: 'Countertops', targetCategory: 'Finishes', targetItemName: 'Countertops (Kitchen & Bath)', defaultCostCode: 'Kitchen_Countertops' },
      { id: 'faucet', label: 'Sink/Faucet', targetCategory: 'Systems', targetItemName: 'Plumbing - Fixtures', defaultCostCode: 'Kitchen_Faucet' },
      { id: 'appliances', label: 'Appliances', targetCategory: 'Appliances', targetItemName: 'Total Appliance Package', defaultCostCode: 'Kitchen_Appliances' },
      { id: 'flooring', label: 'Flooring', targetCategory: 'Flooring', targetItemName: 'LVP (Vinyl Plank Flooring)', defaultCostCode: 'Flooring_LVP' }, // Kitchen often shares with house, but could be specific
      { id: 'lighting', label: 'Lighting', targetCategory: 'Systems', targetItemName: 'Electrical Fixtures / Lighting', defaultCostCode: 'Lighting_Fixtures' },
      { id: 'paint', label: 'Paint', targetCategory: 'Interior', targetItemName: 'Painting - Interior', defaultCostCode: 'Paint_Interior' },
    ]
  },
  {
    id: 'master_bath',
    label: 'Master Bath',
    icon: 'bathroom',
    items: [
      { id: 'vanity', label: 'Vanity/Cabinets', targetCategory: 'Finishes', targetItemName: 'Cabinets (Kitchen & Bath)', defaultCostCode: 'Bath_Vanity' },
      { id: 'toilet', label: 'Toilet', targetCategory: 'Systems', targetItemName: 'Plumbing - Fixtures', defaultCostCode: 'Bath_Toilet' },
      { id: 'tub_shower', label: 'Tub/Shower', targetCategory: 'Finishes', targetItemName: 'Shower Enclosures', defaultCostCode: 'Bath_TubShower' },
      { id: 'tile', label: 'Floor/Wall Tile', targetCategory: 'Flooring', targetItemName: 'Bathroom Tile', defaultCostCode: 'Bath_Tile' },
      { id: 'faucet', label: 'Faucet/Hardware', targetCategory: 'Finishes', targetItemName: 'Finish Hardware', defaultCostCode: 'Bath_Hardware' },
    ]
  },
  {
    id: 'bath_secondary', // Template for extra baths
    label: 'Bathroom',
    icon: 'bathroom',
    items: [
      { id: 'vanity', label: 'Vanity', targetCategory: 'Finishes', targetItemName: 'Cabinets (Kitchen & Bath)', defaultCostCode: 'Bath_Vanity' },
      { id: 'toilet', label: 'Toilet', targetCategory: 'Systems', targetItemName: 'Plumbing - Fixtures', defaultCostCode: 'Bath_Toilet' },
      { id: 'tub', label: 'Tub/Surround', targetCategory: 'Finishes', targetItemName: 'Shower Enclosures', defaultCostCode: 'Bath_TubShower' },
      { id: 'flooring', label: 'Flooring', targetCategory: 'Flooring', targetItemName: 'Bathroom Tile', defaultCostCode: 'Bath_Tile' },
    ]
  },
  {
    id: 'living_room',
    label: 'Living Room',
    icon: 'living_room',
    items: [
      { id: 'flooring', label: 'Flooring', targetCategory: 'Flooring', targetItemName: 'LVP (Vinyl Plank Flooring)', defaultCostCode: 'Flooring_Room' },
      { id: 'paint', label: 'Paint', targetCategory: 'Interior', targetItemName: 'Painting - Interior', defaultCostCode: 'Paint_Room' },
      { id: 'windows', label: 'Windows', targetCategory: 'Structure', targetItemName: 'Window (L & M)', defaultCostCode: 'Windows_General' },
      { id: 'lighting', label: 'Lighting', targetCategory: 'Systems', targetItemName: 'Electrical Fixtures / Lighting', defaultCostCode: 'Lighting_Room' },
    ]
  },
  {
    id: 'bedroom', // Template for extra bedrooms
    label: 'Bedroom',
    icon: 'bedroom',
    items: [
      { id: 'flooring', label: 'Flooring', targetCategory: 'Flooring', targetItemName: 'LVP (Vinyl Plank Flooring)', defaultCostCode: 'Flooring_Room' },
      { id: 'paint', label: 'Paint', targetCategory: 'Interior', targetItemName: 'Painting - Interior', defaultCostCode: 'Paint_Room' },
      { id: 'doors', label: 'Doors', targetCategory: 'Finishes', targetItemName: 'Interior Doors', defaultCostCode: 'Doors_Interior' },
      { id: 'closet', label: 'Closet Trim', targetCategory: 'Finishes', targetItemName: 'Finish Carpentry', defaultCostCode: 'Trim_Baseboards' },
    ]
  },
  {
    id: 'basement',
    label: 'Basement',
    icon: 'basement',
    items: [
        { id: 'framing', label: 'Framing', targetCategory: 'Structure', targetItemName: 'Framing *(L & M)', defaultCostCode: 'Trim_Baseboards' }, // Using Trim as proxy cost or need new code
        { id: 'drywall', label: 'Drywall', targetCategory: 'Interior', targetItemName: 'Drywall', defaultCostCode: 'Paint_Interior' },
        { id: 'waterproofing', label: 'Waterproofing', targetCategory: 'Foundation', targetItemName: 'Basement wall repairs', defaultCostCode: 'Ext_Concrete' },
        { id: 'flooring', label: 'Flooring', targetCategory: 'Flooring', targetItemName: 'LVP (Vinyl Plank Flooring)', defaultCostCode: 'Flooring_LVP' },
        { id: 'sump', label: 'Sump Pump', targetCategory: 'Systems', targetItemName: 'Plumbing - Fixtures', defaultCostCode: 'Kitchen_Faucet' },
    ]
  },
  {
    id: 'exterior',
    label: 'Exterior',
    icon: 'exterior',
    items: [
      { id: 'roof', label: 'Roof', targetCategory: 'Exterior', targetItemName: 'Roofing*', defaultCostCode: 'Ext_Roof' },
      { id: 'siding', label: 'Siding', targetCategory: 'Exterior', targetItemName: 'Siding', defaultCostCode: 'Ext_Siding' },
      { id: 'paint_ext', label: 'Exterior Paint', targetCategory: 'Exterior', targetItemName: 'Painting - Exterior', defaultCostCode: 'Ext_Paint' },
      { id: 'landscaping', label: 'Landscaping', targetCategory: 'Site Improvements', targetItemName: 'Landscape', defaultCostCode: 'Ext_Landscape' },
      { id: 'driveway', label: 'Driveway/Concrete', targetCategory: 'Site Improvements', targetItemName: 'Flatwork', defaultCostCode: 'Ext_Concrete' },
      { id: 'deck', label: 'Deck/Patio', targetCategory: 'Exterior', targetItemName: 'Decks*', defaultCostCode: 'Ext_Deck' },
    ]
  },
  {
    id: 'systems',
    label: 'Systems',
    icon: 'systems',
    items: [
      { id: 'hvac', label: 'HVAC Unit', targetCategory: 'Systems', targetItemName: 'Rough HVAC* (Ductwork)', defaultCostCode: 'Sys_HVAC' },
      { id: 'water_heater', label: 'Water Heater', targetCategory: 'Systems', targetItemName: 'Water Heaters', defaultCostCode: 'Sys_WaterHeater' },
      { id: 'panel', label: 'Electrical Panel', targetCategory: 'Systems', targetItemName: 'Rough Electrical*', defaultCostCode: 'Sys_Panel' },
    ]
  }
];
