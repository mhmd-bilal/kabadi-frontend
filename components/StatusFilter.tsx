import React, { useState } from 'react';
import DropDownPicker from 'react-native-dropdown-picker';
import { View } from 'react-native';

interface StatusDropdownProps {
  statusFilter: string;
  setStatusFilter: React.Dispatch<React.SetStateAction<string>>;
}

export default function StatusDropdown({ statusFilter, setStatusFilter }: StatusDropdownProps) {
  const [open, setOpen] = useState(false);

  const [items, setItems] = useState([
    { label: 'All', value: 'all' },
    { label: 'Scheduled', value: 'scheduled' },
    { label: 'In Progress', value: 'in-progress' },
    { label: 'Completed', value: 'completed' },
  ]);

  return (
    <View className="z-10 mb-2">
      <DropDownPicker
        open={open}
        value={statusFilter}
        items={items}
        setOpen={setOpen}
        setValue={setStatusFilter}
        setItems={setItems}
        placeholder="Select Status"
        style={{
          borderRadius: 8,
          backgroundColor: 'white',
          borderColor: 'none',
          borderWidth: 0,
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.01)',
          paddingVertical: 6, // 👈 reduces the height
          paddingHorizontal: 15,
          minHeight: 26, 
          zIndex:100
        }}
        dropDownContainerStyle={{
          borderRadius: 8,
          borderWidth: 0,
        }}
        labelStyle={{
          fontSize: 14,
          color: '#333',
        }}
        listItemLabelStyle={{
          fontSize: 14,
          color: '#555',
        }}
        selectedItemLabelStyle={{
          color: '#16aa3e',
          fontWeight: 'bold',
        }}
        textStyle={{
          fontSize: 14,
        }}
      />
    </View>
  );
}
