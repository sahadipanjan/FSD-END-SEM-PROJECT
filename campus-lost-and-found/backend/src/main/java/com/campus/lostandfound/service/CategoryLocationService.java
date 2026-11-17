package com.campus.lostandfound.service;

import com.campus.lostandfound.dto.common.CategoryDto;
import com.campus.lostandfound.dto.common.LocationDto;
import com.campus.lostandfound.entity.Category;
import com.campus.lostandfound.entity.Location;
import com.campus.lostandfound.exception.BadRequestException;
import com.campus.lostandfound.exception.ResourceNotFoundException;
import com.campus.lostandfound.repository.CategoryRepository;
import com.campus.lostandfound.repository.ItemRepository;
import com.campus.lostandfound.repository.LocationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CategoryLocationService {

    private final CategoryRepository categoryRepository;
    private final LocationRepository locationRepository;
    private final ItemRepository itemRepository;

    public CategoryLocationService(CategoryRepository categoryRepository,
                                   LocationRepository locationRepository,
                                   ItemRepository itemRepository) {
        this.categoryRepository = categoryRepository;
        this.locationRepository = locationRepository;
        this.itemRepository = itemRepository;
    }

    public List<CategoryDto> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(c -> new CategoryDto(c.getId(), c.getName(), c.getDescription()))
                .toList();
    }

    public List<LocationDto> getAllLocations() {
        return locationRepository.findAll().stream()
                .map(l -> new LocationDto(l.getId(), l.getName(), l.getDescription()))
                .toList();
    }

    @Transactional
    public CategoryDto createCategory(CategoryDto dto) {
        if (categoryRepository.existsByNameIgnoreCase(dto.getName().trim())) {
            throw new BadRequestException("Category with this name already exists");
        }
        Category category = new Category(dto.getName().trim(), dto.getDescription());
        category = categoryRepository.save(category);
        return new CategoryDto(category.getId(), category.getName(), category.getDescription());
    }

    @Transactional
    public CategoryDto updateCategory(Long id, CategoryDto dto) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        if (categoryRepository.existsByNameIgnoreCaseAndIdNot(dto.getName().trim(), id)) {
            throw new BadRequestException("Category with this name already exists");
        }

        category.setName(dto.getName().trim());
        category.setDescription(dto.getDescription());
        category = categoryRepository.save(category);
        return new CategoryDto(category.getId(), category.getName(), category.getDescription());
    }

    @Transactional
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        long count = itemRepository.countByCategoryId(id);
        if (count > 0) {
            throw new BadRequestException("Cannot delete category '" + category.getName() + "'. It is currently assigned to " + count + " items.");
        }

        categoryRepository.delete(category);
    }

    @Transactional
    public LocationDto createLocation(LocationDto dto) {
        if (locationRepository.existsByNameIgnoreCase(dto.getName().trim())) {
            throw new BadRequestException("Location with this name already exists");
        }
        Location location = new Location(dto.getName().trim(), dto.getDescription());
        location = locationRepository.save(location);
        return new LocationDto(location.getId(), location.getName(), location.getDescription());
    }

    @Transactional
    public LocationDto updateLocation(Long id, LocationDto dto) {
        Location location = locationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Location not found with id: " + id));

        if (locationRepository.existsByNameIgnoreCaseAndIdNot(dto.getName().trim(), id)) {
            throw new BadRequestException("Location with this name already exists");
        }

        location.setName(dto.getName().trim());
        location.setDescription(dto.getDescription());
        location = locationRepository.save(location);
        return new LocationDto(location.getId(), location.getName(), location.getDescription());
    }

    @Transactional
    public void deleteLocation(Long id) {
        Location location = locationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Location not found with id: " + id));

        long count = itemRepository.countByLocationId(id);
        if (count > 0) {
            throw new BadRequestException("Cannot delete location '" + location.getName() + "'. It is currently assigned to " + count + " items.");
        }

        locationRepository.delete(location);
    }
}
