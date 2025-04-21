import React, { useState } from 'react';
import DropDownPicker from 'react-native-dropdown-picker';
import { View } from 'react-native';

export default function TeamDropdown({ statusFilter, setStatusFilter }) {
  const [open, setOpen] = useState(false);

  const [items, setItems] = useState([
    { label: 'All', value: 'all' },
    { label: 'Joined', value: 'joined' },
    { label: 'Invitations', value: 'invitations' },
    { label: 'Past', value: 'left' },
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
          minHeight: 26, // 👈 ensures it's not too tall
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
        arrowIconStyle={{
          tintColor: '#16aa3e',
        }}
      />
    </View>
  );
}
