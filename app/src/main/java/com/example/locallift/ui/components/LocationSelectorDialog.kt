package com.example.locallift.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.locallift.ui.theme.GreenPrimary
import com.example.locallift.ui.viewmodel.LocationInfo

private val PRESET_LOCATIONS = listOf(
    LocationInfo("Connaught Place", "Inner Circle, New Delhi", 28.6328, 77.2197),
    LocationInfo("Indiranagar 100ft Rd", "12th Main, Bengaluru", 12.9784, 77.6408),
    LocationInfo("Bandra West Hill Rd", "Near Bandra Station, Mumbai", 19.0596, 72.8295),
    LocationInfo("Cyber City DLF", "Sector 24, Gurugram", 28.4952, 77.0890),
    LocationInfo("Koregaon Park North", "Lane 7, Pune", 18.5362, 73.8940),
    LocationInfo("Sector 17 Plaza", "City Centre, Chandigarh", 30.7398, 76.7827)
)

@Composable
fun LocationSelectorDialog(
    currentLocation: LocationInfo,
    onDismiss: () -> Unit,
    onLocationSelected: (String, String, Double, Double) -> Unit
) {
    var showCustomInput by remember { mutableStateOf(false) }
    var customTitle by remember { mutableStateOf("") }
    var customAddress by remember { mutableStateOf("") }
    var customLat by remember { mutableStateOf(currentLocation.latitude.toString()) }
    var customLon by remember { mutableStateOf(currentLocation.longitude.toString()) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    imageVector = Icons.Default.LocationOn,
                    contentDescription = null,
                    tint = GreenPrimary,
                    modifier = Modifier.size(24.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "Select Delivery Area",
                    fontWeight = FontWeight.Bold,
                    fontSize = 18.sp
                )
            }
        },
        text = {
            Column(modifier = Modifier.fillMaxWidth()) {
                Text(
                    text = "Choose a neighborhood to discover verified local shops with exact real-time GPS distance.",
                    fontSize = 13.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Spacer(modifier = Modifier.height(12.dp))

                if (!showCustomInput) {
                    LazyColumn(
                        modifier = Modifier.height(230.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        items(PRESET_LOCATIONS) { loc ->
                            val isSelected = loc.title == currentLocation.title
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .background(
                                        color = if (isSelected) GreenPrimary.copy(alpha = 0.12f)
                                        else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
                                        shape = RoundedCornerShape(12.dp)
                                    )
                                    .clickable {
                                        onLocationSelected(loc.title, loc.address, loc.latitude, loc.longitude)
                                        onDismiss()
                                    }
                                    .padding(horizontal = 12.dp, vertical = 10.dp)
                                    .testTag("preset_location_${loc.title.replace(' ', '_')}"),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Column(modifier = Modifier.weight(1f)) {
                                    Text(
                                        text = loc.title,
                                        fontWeight = FontWeight.SemiBold,
                                        fontSize = 14.sp
                                    )
                                    Text(
                                        text = loc.address,
                                        fontSize = 12.sp,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                }
                                if (isSelected) {
                                    Icon(
                                        imageVector = Icons.Default.Check,
                                        contentDescription = "Selected",
                                        tint = GreenPrimary,
                                        modifier = Modifier.size(20.dp)
                                    )
                                }
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(8.dp))
                    TextButton(
                        onClick = { showCustomInput = true },
                        modifier = Modifier
                            .align(Alignment.CenterHorizontally)
                            .testTag("btn_custom_gps_coords")
                    ) {
                        Icon(
                            imageVector = Icons.Default.LocationOn,
                            contentDescription = null,
                            modifier = Modifier.size(16.dp),
                            tint = GreenPrimary
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "Or enter custom GPS coordinates",
                            color = GreenPrimary,
                            fontWeight = FontWeight.Medium,
                            fontSize = 13.sp
                        )
                    }
                } else {
                    OutlinedTextField(
                        value = customTitle,
                        onValueChange = { customTitle = it },
                        label = { Text("Area / Landmark Name") },
                        placeholder = { Text("e.g. My Neighborhood") },
                        singleLine = true,
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("input_custom_area_title")
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    OutlinedTextField(
                        value = customAddress,
                        onValueChange = { customAddress = it },
                        label = { Text("Street Address") },
                        placeholder = { Text("e.g. Flat 301, Park Street") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        OutlinedTextField(
                            value = customLat,
                            onValueChange = { customLat = it },
                            label = { Text("Latitude") },
                            modifier = Modifier.weight(1f),
                            singleLine = true
                        )
                        OutlinedTextField(
                            value = customLon,
                            onValueChange = { customLon = it },
                            label = { Text("Longitude") },
                            modifier = Modifier.weight(1f),
                            singleLine = true
                        )
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    TextButton(onClick = { showCustomInput = false }) {
                        Text("Back to Presets")
                    }
                }
            }
        },
        confirmButton = {
            if (showCustomInput) {
                Button(
                    onClick = {
                        val lat = customLat.toDoubleOrNull() ?: currentLocation.latitude
                        val lon = customLon.toDoubleOrNull() ?: currentLocation.longitude
                        val title = customTitle.ifBlank { "Custom Location" }
                        val addr = customAddress.ifBlank { "%.4f, %.4f".format(lat, lon) }
                        onLocationSelected(title, addr, lat, lon)
                        onDismiss()
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = GreenPrimary),
                    modifier = Modifier.testTag("btn_save_custom_location")
                ) {
                    Text("Apply GPS")
                }
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    )
}
