package com.example.locallift.ui.components

import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.locallift.ui.viewmodel.LocationInfo
import com.example.locallift.ui.viewmodel.VendorWithDistance
import kotlin.math.atan2
import kotlin.math.cos
import kotlin.math.min
import kotlin.math.sin

@Composable
fun HyperlocalMapCanvas(
    userLocation: LocationInfo,
    radiusKm: Double,
    vendors: List<VendorWithDistance>,
    onSelectVendor: (Long) -> Unit,
    modifier: Modifier = Modifier
) {
    val infiniteTransition = rememberInfiniteTransition(label = "pulse")
    val pulseRadiusFraction by infiniteTransition.animateFloat(
        initialValue = 0.2f,
        targetValue = 1.0f,
        animationSpec = infiniteRepeatable(
            animation = tween(2200, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "pulseRadius"
    )

    Card(
        modifier = modifier
            .fillMaxWidth()
            .height(210.dp)
            .testTag("hyperlocal_map_canvas_card"),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(
            containerColor = Color(0xFF0F172A)
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Box(modifier = Modifier.fillMaxSize()) {
            Canvas(
                modifier = Modifier
                    .fillMaxSize()
                    .clip(RoundedCornerShape(20.dp))
                    .pointerInput(vendors, radiusKm) {
                        detectTapGestures { tapOffset ->
                            val centerX = size.width / 2f
                            val centerY = size.height / 2f
                            val maxCanvasRadius = min(centerX, centerY) * 0.88f

                            // Find nearest vendor within 28dp of tap
                            var closestVendorId: Long? = null
                            var minDistancePx = Float.MAX_VALUE

                            for (item in vendors) {
                                val dLat = item.vendor.latitude - userLocation.latitude
                                val dLon = item.vendor.longitude - userLocation.longitude
                                val angle = atan2(dLat, dLon)

                                val normDist = (item.distanceKm / radiusKm).coerceAtMost(1.0)
                                val pinDist = (normDist * maxCanvasRadius).toFloat()
                                val pinX = centerX + pinDist * cos(angle).toFloat()
                                val pinY = centerY - pinDist * sin(angle).toFloat()

                                val dx = tapOffset.x - pinX
                                val dy = tapOffset.y - pinY
                                val clickDist = kotlin.math.sqrt(dx * dx + dy * dy)

                                if (clickDist < 50f && clickDist < minDistancePx) {
                                    minDistancePx = clickDist
                                    closestVendorId = item.vendor.id
                                }
                            }

                            closestVendorId?.let { onSelectVendor(it) }
                        }
                    }
            ) {
                val centerX = size.width / 2f
                val centerY = size.height / 2f
                val maxCanvasRadius = min(centerX, centerY) * 0.88f

                // Draw subtle grid lines
                drawLine(
                    color = Color(0xFF1E293B),
                    start = Offset(centerX, 0f),
                    end = Offset(centerX, size.height),
                    strokeWidth = 1f
                )
                drawLine(
                    color = Color(0xFF1E293B),
                    start = Offset(0f, centerY),
                    end = Offset(size.width, centerY),
                    strokeWidth = 1f
                )

                // Concentric range rings
                val rings = listOf(0.33f, 0.66f, 1.0f)
                val dashEffect = PathEffect.dashPathEffect(floatArrayOf(8f, 8f), 0f)

                rings.forEach { frac ->
                    val r = maxCanvasRadius * frac
                    drawCircle(
                        color = Color(0xFF334155),
                        radius = r,
                        center = Offset(centerX, centerY),
                        style = Stroke(width = 1.2f, pathEffect = dashEffect)
                    )
                }

                // Active radar boundary highlight
                drawCircle(
                    color = Color(0xFF16A34A).copy(alpha = 0.25f),
                    radius = maxCanvasRadius,
                    center = Offset(centerX, centerY),
                    style = Stroke(width = 2f)
                )

                // Animated pulsing ring around user center
                drawCircle(
                    color = Color(0xFF22C55E).copy(alpha = (1f - pulseRadiusFraction) * 0.5f),
                    radius = maxCanvasRadius * pulseRadiusFraction,
                    center = Offset(centerX, centerY),
                    style = Stroke(width = 2f)
                )

                // Center user pin
                drawCircle(
                    color = Color(0xFF22C55E).copy(alpha = 0.35f),
                    radius = 16f,
                    center = Offset(centerX, centerY)
                )
                drawCircle(
                    color = Color(0xFF22C55E),
                    radius = 8f,
                    center = Offset(centerX, centerY)
                )
                drawCircle(
                    color = Color.White,
                    radius = 3.5f,
                    center = Offset(centerX, centerY)
                )

                // Plot Vendor Pins
                for (item in vendors) {
                    val dLat = item.vendor.latitude - userLocation.latitude
                    val dLon = item.vendor.longitude - userLocation.longitude
                    val angle = atan2(dLat, dLon)

                    val normDist = (item.distanceKm / radiusKm).coerceAtMost(1.0)
                    val pinDist = (normDist * maxCanvasRadius).toFloat()
                    val pinX = centerX + pinDist * cos(angle).toFloat()
                    val pinY = centerY - pinDist * sin(angle).toFloat()

                    val pinColor = CategoryIconHelper.getColor(item.vendor.category)

                    // Outer halo
                    drawCircle(
                        color = pinColor.copy(alpha = 0.35f),
                        radius = 12f,
                        center = Offset(pinX, pinY)
                    )
                    // Inner dot
                    drawCircle(
                        color = pinColor,
                        radius = 6.5f,
                        center = Offset(pinX, pinY)
                    )
                    drawCircle(
                        color = Color.White,
                        radius = 2.5f,
                        center = Offset(pinX, pinY)
                    )
                }
            }

            // Top Badges Overlay
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 14.dp, vertical = 10.dp)
            ) {
                // Left: Active Location Badge
                Text(
                    text = "📍 ${userLocation.title}",
                    color = Color.White,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.SemiBold,
                    modifier = Modifier
                        .align(Alignment.TopStart)
                        .background(Color(0xFF1E293B).copy(alpha = 0.85f), RoundedCornerShape(12.dp))
                        .padding(horizontal = 10.dp, vertical = 4.dp)
                )

                // Right: Radius & Count Badge
                Text(
                    text = "📡 ${radiusKm}km radar (${vendors.count { it.isWithinRadius }} shops)",
                    color = Color(0xFF4ADE80),
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Medium,
                    modifier = Modifier
                        .align(Alignment.TopEnd)
                        .background(Color(0xFF14532D).copy(alpha = 0.85f), RoundedCornerShape(12.dp))
                        .padding(horizontal = 10.dp, vertical = 4.dp)
                )
            }
        }
    }
}
