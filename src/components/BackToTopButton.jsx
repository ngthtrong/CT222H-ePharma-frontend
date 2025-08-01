import React, { useState, useEffect } from 'react';
import {
    Fab,
    Zoom,
    useScrollTrigger,
    useTheme,
    useMediaQuery,
    Tooltip,
} from '@mui/material';
import {
    KeyboardArrowUp as ArrowUpIcon,
} from '@mui/icons-material';

const BackToTopButton = ({
    showAt = 300,
    scrollBehavior = 'smooth',
    size = 'medium',
    color = 'primary',
    position = { bottom: 40, right: 40 },
    hideOnMobile = false,
    showTooltip = true,
    tooltipText = 'Lên đầu trang',
    ...props
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [isVisible, setIsVisible] = useState(false);

    // Use MUI's scroll trigger for better performance
    const trigger = useScrollTrigger({
        disableHysteresis: true,
        threshold: showAt,
    });

    useEffect(() => {
        setIsVisible(trigger);
    }, [trigger]);

    const handleClick = () => {
        window.scrollTo({
            top: 0,
            behavior: scrollBehavior,
        });
    };

    // Hide on mobile if hideOnMobile is true
    if (hideOnMobile && isMobile) {
        return null;
    }

    const fabComponent = (
        <div
            style={{
                position: 'fixed',
                bottom: isMobile ? '20px' : `${position.bottom}px`,
                right: isMobile ? '20px' : `${position.right}px`,
                zIndex: 9999,
            }}
        >
            <Zoom in={isVisible} timeout={theme.transitions.duration.enteringScreen}>
                <Fab
                    onClick={handleClick}
                    size={size}
                    color={color}
                    aria-label="Back to top"
                    sx={{
                        boxShadow: '0 4px 20px rgba(63, 133, 233, 0.3)',
                        transition: 'all 0.3s ease',
                        // Responsive sizing  
                        ...(isMobile && {
                            width: '48px',
                            height: '48px',
                        }),
                        // Gradient background effect for enhanced visual appeal
                        background: color === 'primary' ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)` : undefined,
                        // Pulse animation for attention
                        '@keyframes pulse': {
                            '0%': {
                                boxShadow: '0 4px 20px rgba(63, 133, 233, 0.3)',
                            },
                            '50%': {
                                boxShadow: '0 4px 20px rgba(63, 133, 233, 0.5)',
                            },
                            '100%': {
                                boxShadow: '0 4px 20px rgba(63, 133, 233, 0.3)',
                            },
                        },
                        animation: 'pulse 2s infinite',
                        '&:hover': {
                            animation: 'none',
                            transform: 'translateY(-3px)',
                            boxShadow: '0 6px 25px rgba(63, 133, 233, 0.4)',
                        },
                    }}
                    {...props}
                >
                    <ArrowUpIcon />
                </Fab>
            </Zoom>
        </div>
    );

    // Wrap with tooltip if enabled
    if (showTooltip && !isMobile) {
        return (
            <Tooltip
                title={tooltipText}
                placement="left"
                arrow
                sx={{
                    '& .MuiTooltip-tooltip': {
                        bgcolor: 'grey.800',
                        color: 'white',
                        fontSize: '0.75rem',
                        borderRadius: 1,
                    },
                    '& .MuiTooltip-arrow': {
                        color: 'grey.800',
                    },
                }}
            >
                {fabComponent}
            </Tooltip>
        );
    }

    return fabComponent;
};

export default BackToTopButton;
